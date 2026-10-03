# FAITS-L2-ACCESS-1 : points d accès, conditions et région pour l enregistreur L2 Binance, lus sur place le 2026-10-03

Lu par l orchestrateur MONARK (`claude-opus-5-5`) le 2026-10-03 entre 17:57 et 18:06 UTC (horloge lue avant et après), dans le
navigateur interne, avant tout appel aux points d accès. Aucune requête de données faite ; aucun compte, aucune clé. Bannière de
témoins de developers.binance.com refusée (« Reject »). Objet : questions Q-6, Q-7, Q-8, Q-9 de RECHERCHES
(`coordination/messages/2026-10-03-RECHERCHES-vers-MONARK-catalogue-revise.md`) et les sept points pliés de l audit
(`…-MONARK-vers-RECHERCHES-L2-pli-et-depart.md`). Empreintes : sha256 du texte rendu par la page (`innerText`, UTF-8), calculé
dans la page ; pour un PDF, sha256 du nom de fichier servi (égal au sha256 de ses octets selon le FAITS du 2026-10-01) et du texte
extrait. Les citations font 25 mots au plus.

## 1. Spot : flux WebSocket (`binance-spot-api-docs`, dépôt officiel de Binance)

- [lu] https://raw.githubusercontent.com/binance/binance-spot-api-docs/master/web-socket-streams.md, texte de 22 958 caractères,
  sha256 `32bf73a0bed3b75e3ca981fdbaf48c53544bbdfb5944ef8ed1c4d7af9aceba0a`. La page de la nouvelle documentation
  (developers.binance.com, catalogue « ws-streams ») dit la même chose pour les flux lus ; le texte suivi ici est celui du dépôt.
- Connexion : « A single connection to stream.binance.com is only valid for 24 hours; expect to be disconnected at the 24 hour
  mark. » Événement `serverShutdown` avant un arrêt du serveur. Ping du serveur toutes les 20 s ; pas de pong en une minute :
  déconnexion. Point d accès réservé aux données de marché : `wss://data-stream.binance.vision`.
- Limites : 5 messages entrants par seconde (ping, pong, messages JSON) ; 1 024 flux au plus par connexion ; « 300 connections
  per attempt every 5 minutes per IP ». Heures en millisecondes par défaut, en microsecondes avec `timeUnit=MICROSECOND`.
- Carnet par différences : `<symbol>@depth` ou `<symbol>@depth@100ms` (1 000 ms ou 100 ms), champs `U` (premier identifiant de
  mise à jour) et `u` (dernier). Procédure « How to manage a local order book correctly » : tampon des événements, instantané
  `GET /api/v3/depth?limit=5000`, rejet des événements `u` ≤ `lastUpdateId`, et « If the event first update ID (U) is greater than
  the update ID of your local order book + 1, you have missed some events. » Note de la page : l instantané est borné à 5 000
  niveaux par côté ; les niveaux hors de l instantané restent inconnus tant qu ils ne changent pas.
- Instantanés partiels : `<symbol>@depth<levels>` avec 5, 10 ou 20 niveaux, toutes les 1 000 ms ou 100 ms, champ `lastUpdateId`.
  Vingt niveaux au plus par ce flux : la profondeur « 100 points de base » du point 1 de l audit ne peut venir que du carnet
  reconstruit (différences sur instantané REST), pas de ce flux.
- Meilleur prix : `<symbol>@bookTicker`, « Real-time », champ `u` (identifiant de mise à jour du carnet), prix et quantités en
  chaînes décimales. Transactions : `<symbol>@trade`, champ `t` (identifiant de transaction), `T`, `m` ; `<symbol>@aggTrade`.

## 2. Spot : REST (`rest-api.md`, même dépôt)

- [lu] https://raw.githubusercontent.com/binance/binance-spot-api-docs/master/rest-api.md, 181 007 caractères, sha256
  `49ea6809243fc7fb426e07f2fe662097736c7bb405bd2da5eef637d715427999` : égal à l empreinte du 2026-10-01
  (`docs/marche/FAITS-binance-klines-2026-10-01.md`), texte inchangé depuis.
- `GET /api/v3/depth` : poids selon `limit` (1-100 : 5 ; 101-500 : 25 ; 501-1000 : 50 ; 1001-5000 : 250) ; `limit` au plus 5 000.
- Limites d IP : en-têtes `X-MBX-USED-WEIGHT-…` à chaque réponse ; un 429 oblige à reculer ; les récidives mènent à un 418 et à un
  bannissement « from 2 minutes to 3 days » ; `Retry-After` en secondes. `GET /api/v3/exchangeInfo` : poids 20.

## 3. Futures USDⓈ-M : liquidations, open interest, connexion (documentation « legacy » de developers.binance.com)

La nouvelle documentation rend une page 404 pour les liquidations (lu à 18:0x) ; la documentation « legacy », marquée comme telle par
Binance, est la source lue ici. Une relecture sur la nouvelle documentation est due avant la première course (item ci-dessous).
- [lu] https://developers.binance.com/legacy-docs/derivatives/usds-margined-futures/websocket-market-streams (Connect) : base
  `wss://fstream.binance.com`, trois routes `/public`, `/market`, `/private` ; une connexion sans route ne reçoit que la route
  publique ; connexion valable 24 h ; ping du serveur toutes les 3 minutes, déconnexion sans pong en 10 minutes ; 10 messages
  entrants par seconde ; 1 024 flux par connexion.
- [lu] …/websocket-market-streams/Liquidation-Order-Streams : route `/market`, flux `<symbol>@forceOrder`, 1 000 ms ; « For each
  symbol, only the largest one liquidation order within 1000ms will be pushed as the snapshot. » C est un ÉCHANTILLON par
  construction (point 7 de l audit) : au plus une liquidation par symbole et par seconde.
- [lu] …/market-data/rest-api/Open-Interest : `GET /fapi/v1/openInterest`, poids 1, valeur présente avec son heure.
- [lu] …/market-data/rest-api/Open-Interest-Statistics : `GET /futures/data/openInterestHist`, périodes de `5m` à `1d`, « Only the
  data of the latest 1 month is available. », 1 000 requêtes par 5 minutes par IP, horodatage = fin de la période. Donc l open
  interest à 5 minutes se rattrape pendant un mois : une lecture par jour de la veille suffit, sans sonde continue.

## 4. Fichiers publics (Q-7) et leurs conditions

- [lu] https://raw.githubusercontent.com/binance/binance-public-data/master/README.md, 5 282 caractères, sha256
  `2e133d9945a9263a02781369078e72805eff074680f305cd5460016471c6caad` : data.binance.vision publie, par jour et par mois, pour le
  spot `aggTrades`, `klines`, `trades` (heures en microsecondes depuis le 2025-01-01) ; pour les futures `aggTrades` et `klines`.
  Aucun fichier de carnet d ordres, de meilleur prix, de liquidations ni d open interest n est listé par ce README.
- [lu] https://raw.githubusercontent.com/binance/binance-public-data/master/TERMS_AND_CONDITIONS.md (« BINANCE VISION DATASET
  TERMS », version 1.0, « Last Updated: August 26, 2026 »), 9 798 caractères, sha256
  `dcf358e9d18f598a7a635fac80f6e643fa24a0e111a4d39bda47f1e246b31eb1` : licence CC BY-NC-SA 4.0 (3.1) ; usage commercial exclu
  sauf licence écrite (3.4) ; usages permis limités à la recherche académique, aux projets éducatifs non monétisés et au
  « algorithmic historical backtesting for purely personal non-production research » (4.1) ; interdits : intégration dans des
  produits financiers commerciaux (4.4), signaux distribués contre rémunération (4.2).
- **Lecture MONARK** : ces conditions visent les fichiers de data.binance.vision, pas l API. MONARK n en a téléchargé aucun ; toute
  utilisation future de ces fichiers (rattrapage des transactions, priorité 3 de l avis) attend une décision du fondateur, car
  MONARK n est pas un projet « purely personal non-production ». Les transactions s enregistrent donc par l API, comme les bougies.

## 5. Conditions générales, pays interdits, usages interdits (Q-6, et la région de l hôte)

- [lu] https://www.binance.com/en/about-legal/terms : sert le PDF de sha256 `bf4879710c904b991848972ec4818ba2cf9e4ce314c09adae84fa2750d3477f7`,
  le même que le 2026-10-01 (73 pages) : conditions inchangées depuis la lecture des séries.
- Éligibilité (clause 2.1 (f), p. 6) : ne pas être situé dans une juridiction « listed in our List of Prohibited Countries ». Lien du
  PDF : https://www.binance.com/en/legal/list-of-prohibited-countries.
- [lu] Liste des pays interdits (PDF `2dead3dd5d9bccb32694e2f0fe5c7f2c6b583e7a6f851296edef7088340e6df5`, « Updated: 5 January 2026 ») :
  (i) situé ou opérant aux États-Unis ; (ii) situé, établi ou résident au Canada ou aux Pays-Bas ; (iii) Cuba, Corée du Nord, Iran,
  Crimée, et les régions dites de Donetsk et de Louhansk.
- [lu] « Prohibited Use Policy », trouvée par le lien de la clause 31 (p. 47) : https://www.binance.com/en/about-legal/prohibited-use-policy
  (PDF `3c287bd60863eccef6a16b8580190c96d4c9414931928d7fafdb227bf967cd63`, « Last updated: 5 January 2026 », 3 pages, sha256 du texte
  `d529a4dcfbc0aee5e4b477ff2b3367620b181a802dfc438ee3ae2b44e27e036f`). Section I : l usage de « bots, spiders, automated devices,
  programs, scripts » pour obtenir ou copier les services est interdit « except as expressly permitted » ; interdit aussi : les
  mandataires d anonymisation. **La demande de procurement du 2026-10-01 (document introuvable) est close** : le document est lu.
- **Lecture MONARK** : les flux et points d accès de la documentation publique de l API sont l accès « expressly permitted » ;
  l enregistreur passe par eux seuls, sans mandataire (sa garde refuse les variables de mandataire), aux limites de la section 1.
  La réserve sur cette politique avait été levée par l investisseur (message de RECHERCHES du 2026-10-03) ; elle est maintenant
  lue. Licence inchangée (clause 27 : usage interne, aucune redistribution).
- **Région de l hôte (point 5 de l audit), NON établie** : le pays du serveur du site n est écrit nulle part dans les documents de
  MONARK (recherche faite dans `docs/`), et aucune attribution d adresse n est faite (règle de recherche). Il ne doit être ni aux
  États-Unis, ni au Canada, ni aux Pays-Bas, ni dans les territoires du (iii). **Question à l investisseur** : dans quel pays le
  serveur du site est-il hébergé ? Aucun appel de l enregistreur depuis cet hôte avant la réponse ; le même contrôle vaut pour le
  second hôte.

## 6. Q-8 et Q-9

- Q-9 (historique Pyth) : déjà lu, `docs/marche/FAITS-USDT-USD-HISTORY-1-conditions-2026-10-03.md` partie 3 (API historique payante
  depuis le 2026-08-26) ; rien de neuf.
- Q-8 (nœud d archive pour l état on-chain) : non lu ce jour, hors du premier périmètre (priorité 2 de l avis). Item
  FAITS-ARCHIVE-NODE-1 : lire les conditions d un fournisseur de nœud d archive avant tout enregistreur d état des protocoles de prêt ;
  déclencheur : la mission de cet enregistreur.

## 7. Ce que ces faits imposent à la mission RECORDER-L2-1

1. Profondeur à 100 points de base : carnet reconstruit par différences `@depth@100ms` sur instantané REST `limit=5000`, chaîne
   `U`/`u` contrôlée à chaque événement (toute rupture = trou nommé, puis reprise par nouvel instantané) ; instantané par minute écrit
   depuis le carnet reconstruit, avec la distance atteinte et le nombre de niveaux ; niveaux au-delà de l instantané initial déclarés
   inconnus tant qu ils ne changent pas.
2. Reconnexion avant la borne des 24 h et sur `serverShutdown`, pong à chaque ping ; au plus 5 messages entrants par seconde.
3. Poids REST : un instantané `limit=5000` pèse 250 ; une reprise par symbole et par rupture ; en-têtes de poids journalisés ; 429
   et 418 arrêtent la reprise et attendent `Retry-After`.
4. Liquidations : `@forceOrder` sur la route `/market`, échantillon déclaré au manifeste (une par symbole et par seconde au plus).
5. Open interest : `openInterestHist` à 5 minutes, une lecture quotidienne de la veille (fenêtre d un mois).
6. `exchangeInfo` spot et futures une fois par jour (poids 20 côté spot).
7. Aucun fichier de data.binance.vision.

## 8. Items formés par ce FAITS

- L2-REGION-HOST-1 : pays du serveur du site, réponse de l investisseur, avant tout appel depuis cet hôte (et pour le second hôte).
- FAITS-L2-NEWDOCS-1 : relire liquidations et connexion futures sur la nouvelle documentation quand elle sert ces pages ; déclencheur :
  avant la première course en ligne.
- FAITS-ARCHIVE-NODE-1 : voir 6.

## Ajout daté du 2026-10-03 à 18:52 UTC : région de l hôte (L2-REGION-HOST-1)

- Réponse de l investisseur, choix « France » à la question posée le 2026-10-03 vers 18:50 UTC (pays d hébergement du serveur du site).
- La France n est pas sur la liste des pays interdits du 5 janvier 2026 (section 5) : l hôte est admis pour l enregistreur L2.
  L2-REGION-HOST-1 est clos pour cet hôte ; le second hôte (RECORDER-L2-REGION-2) passera le même contrôle avant tout appel.
