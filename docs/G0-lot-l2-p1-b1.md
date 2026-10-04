# G0 du lot P1-b1 du chantier L2 : client REST de l'enregistreur (profondeur, exchangeInfo, heure de la place)

- **Rattachement** : ADR-L2-CAPTURE-1 (D-24, TL-2, TL-6, D-27 : 547 lignes par lot au gel) ; plan `docs/G0-partie-l2-p1.md` §3 points 4 et
  9 à 14, §4.3, §8.2 (ligne P1-b1), §8.3 ; faits `docs/marche/FAITS-L2-ACCESS-2-2026-10-03.md` (a), (b), (k), et l.18 pour l'origine
  REST spot ; items SERIES-BODY-BOUND-1, SERIES-ERROR-BODY-1, SERIES-TLS-PEER-LOG-1 (§9 du plan).
- **Base** : `f5596bf3` (`origin/lot/l2-p1-a1`, place factice). Branche `recherches/l2-p1-b1`, worktree propre. Auteur : RECHERCHES,
  en partage de charge du chantier L2 de MONARK, qui fait le contrôle par diff et la fusion. Aucun réseau : tous les tests tournent
  contre la place factice de boucle locale de P1-a1 et des sockets de test.
- **Dépendances** (§8.3) : b1 sur a1 seulement. Les lots a2 à a4 ne sont pas encore fusionnés ; b1 n'en lit rien.

## Contenu (fichiers de §8.2)

`scripts/l2/rest.mjs`, `scripts/l2/rest.d.mts`, `test/l2-rest.test.ts`. Conventions de `scripts/record-binance-klines.mjs` : origine codée
en dur et hôte contrôlé avant chaque requête (liste fermée), redirections refusées (tout 3xx s'arrête, rien n'est suivi), aucun en-tête
posé, aucune reprise, délai de 30 s, arrêts nommés en liste fermée (`STOPS`), corps gardé tel que reçu avant toute lecture, aucune
re-sérialisation de décimaux.

1. **Trois lectures** (§3 point 9) : `depth` avec `limit=5000` (poids 250), `exchangeInfo` d'un symbole (poids 20), heure de la place
   (poids 1). Le poids figure à chaque ligne de `requests.jsonl`.
2. **Journal** : toute réponse donne une ligne de `requests.jsonl` : genre, symbole, URL, poids, statut, heures locales d'envoi et de
   réception en µs (entiers), octets, sha256, chemin gardé, empreinte TLS de la place, en-têtes `date`, `x-mbx-used-weight-1m`,
   `retry-after` (§3 point 10).
3. **Corps borné et gardé** (SERIES-BODY-BOUND-1, SERIES-ERROR-BODY-1, §3 point 12) : lu par morceaux sous 8 Mio ; au-delà, arrêt nommé
   `body_too_large`, ligne journalisée, rien de gardé ; un 200 sous `rest/<SYMBOLE>/<SYMBOLE>-<genre>-<heure>.json`, tout autre statut sous
   `rest/errors/…-<statut>.json` (`ALL` pour l'heure de la place, qui n'a pas de symbole), écrit avant toute lecture.
4. **429 et 418** : suspension de toute requête de ce client jusqu'à l'heure de réception plus `Retry-After` secondes ; `rate_limited`
   ou `ip_banned` nommés ; une requête pendant la suspension rend `suspended` sans rien envoyer. `Retry-After` absent ou illisible :
   60 s (la fenêtre du plafond, D24-2) ; choix écrit, question Q-B1-2.
5. **451** : arrêt nommé `restricted_location` ; toute requête suivante de ce client rend `stopped` sans rien envoyer.
6. **exchangeInfo** (§3 point 14) : `tickSize` de `PRICE_FILTER` gardé en chaîne ; échelle s = rang de la dernière décimale non nulle ;
   tableau `rateLimits` tel que reçu et plafond `REQUEST_WEIGHT` par minute ; toute autre forme : `exchange_info_shape`.
7. **Écart d'horloge** (§3 point 13 ; Q-P1-13) : `serverTime` (ms) × 1 000 moins le milieu des heures locales d'envoi et de réception en
   µs, arrondi vers le bas ; une ligne `clock_offset` dans `journal.jsonl` ; `serverTime` qui n'est pas un entier sûr : écart nul, nommé
   `server_time_not_safe_integer` (condition (2) de RECHERCHES).
8. **Certificat de la place** (SERIES-TLS-PEER-LOG-1) : empreinte `fingerprint256` du certificat du pair lue sur le socket que publie le
   canal `undici:client:connected` pendant une requête ; `connectParams` et toute adresse du socket ne sont jamais lus ; une
   connexion réutilisée ou en clair donne `null`. Les requêtes d'un client passent une à la fois (le canal est global au processus).

## Tests (les huit de §8.2), tueurs

Chaque test charge le module par un import dynamique qu'il affirme : la base, sans `scripts/l2/`, rougit par assertion.
- `l2_rest_logged_and_kept_before_read` (poids de `depth`), `l2_rest_429_418_suspend_until_retry_after` (classe 418 retirée),
  `l2_rest_451_stops_all` (arrêt sur 451 retiré), `l2_rest_body_bound_named` (`>` en `>=`), `l2_rest_host_and_redirect_refused`
  (contrôle du schéma retiré), `l2_exchangeinfo_scale_and_limits` (zéros de queue), `l2_time_offset_logged` (arrondi du milieu),
  `l2_tls_peer_logged_without_address` (champ du certificat). Le dernier publie sur le canal un message de test dont le socket porte un
  certificat et des adresses, et vérifie qu'aucune adresse n'atteint `requests.jsonl`.

## Taille

Plan : c 100, d 31, t 143 à 227 (274 à 358). Mesure avant le gel : c 153, d 81, t 179, soit 413 lignes, sous 547 ; d dépasse le plan
(types des lignes de journal et des faits écrits en entier pour le test typé).

## Questions pour MONARK

- **Q-B1-1** : FAITS-L2-ACCESS-3 (d) et (f), prérequis du G1 de b1 (§8.3), ne sont pas au dépôt. b1 ne lit aucun tableau de niveaux
  (`depth` est gardé brut, lu par b2) ; il lit `symbols[].filters[].filterType`, `tickSize`, `rateLimits[].rateLimitType`, `interval`,
  `intervalNum`, `limit`, noms non encore épinglés par un FAITS : à confirmer par (f) avant la fusion.
- **Q-B1-2** : `Retry-After` absent ou illisible sur 429 ou 418 : 60 s (choix de ce lot) ou arrêt nommé ?
- **Q-B1-3** : Q-P1-6 (plafond du jour sous 4 000) se décide dans la boucle (c5) : b1 rend le plafond lu, sans politique.
