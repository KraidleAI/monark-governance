# FAITS-L2-ACCESS-3 : liste fermée (a) à (f) du plan de P1, lue sur place le 2026-10-04

Lecture par l orchestrateur MONARK (`claude-opus-5-5`) le 2026-10-04 entre 01:16 et 01:18 UTC (horloge lue avant et après), dans le
navigateur interne. Objet : la liste fermée de `docs/G0-partie-l2-p1.md` §6 (« FAITS-L2-ACCESS-3 »). Déclencheurs : (a) avant le G1 de
P1-a3 ; (b), (c) et (e) avant celui de P1-a4 ; (d) et (f) avant celui de P1-b1. (d) et (f) arrivent après le G1 de P1-b1, faute de
l orchestrateur : il a passé le lot à RECHERCHES sans eux (plan, bloc daté du 2026-10-04 01:1x UTC). Empreintes : sha256 du texte rendu
(`innerText`, UTF-8), calculé dans la page. Citations de 25 mots au plus. Aucune requête à la place ; aucune valeur de marché.

Sources :
- [WS] https://raw.githubusercontent.com/binance/binance-spot-api-docs/master/web-socket-streams.md, sha256
  `32bf73a0bed3b75e3ca981fdbaf48c53544bbdfb5944ef8ed1c4d7af9aceba0a`, 654 lignes. L empreinte est égale à celle de FAITS-L2-ACCESS-2.
- [REST] https://raw.githubusercontent.com/binance/binance-spot-api-docs/master/rest-api.md, sha256
  `49ea6809243fc7fb426e07f2fe662097736c7bb405bd2da5eef637d715427999`, 4 951 lignes. L empreinte est égale à celle de FAITS-L2-ACCESS-2.
- [ENUM] https://raw.githubusercontent.com/binance/binance-spot-api-docs/master/enums.md, sha256
  `5708fe6fdea8013f6c8a8388074c8cef8482b2b69a09181e4b2b36e0c2b4ab4b`, 218 lignes.
- [FIL] https://raw.githubusercontent.com/binance/binance-spot-api-docs/master/filters.md, sha256
  `4b5a8f0f5d15bcf68fd7ac2059ba6c88da641c06fd7885e642330c5ac8124dd3`, 400 lignes. L empreinte est égale à celle de FAITS-L2-ACCESS-2.
- [FWS] https://developers.binance.com/legacy-docs/derivatives/usds-margined-futures/websocket-market-streams, sha256
  `921bc1bda7e6bfc3e9eeab1f14ec1d5b0c1f7c6a04baf4991d052c8769d8671a`, 35 lignes.
- [FCN] https://developers.binance.com/legacy-docs/derivatives/usds-margined-futures/websocket-market-streams/Important-WebSocket-Change-Notice,
  sha256 `4903a5ea73a6533e2c2149b443a708743cd2925ad5de5b7cb63d518dfd6b86ba`, 75 lignes.
- [FNEW] https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams. Redirigée vers
  `…/en/docs/catalog/core-trading-derivatives-trading-usd-s-m-futures/api/ws-streams/public`, titre « Public - Futures (USDⓈ-M)
  WebSocket Market Streams ». La page existe désormais (FAITS-L2-NEWDOCS-1 la donnait absente le 2026-10-03), mais son corps n est
  pas rendu dans le navigateur interne : 20 lignes de cadre seulement, sha256 `b372484590fbc5a20a8b2d7e2e77aea3b18faf4fa5f6bc68d1698300ad0fc26e`,
  y compris après 9 s d attente et par extraction du texte. `llms.txt` rend un corps vide. **NON LU**.

## Liste fermée

- **(a) bases spot en forme combinée, et validité des règles pour la base des données de marché** [lu, WS] :
  - bases : `wss://stream.binance.com:9443` ou `wss://stream.binance.com:443` (l.38) ;
  - base des données de marché seules : `wss://data-stream.binance.vision`, sans port écrit (l.50) ;
  - forme combinée : `/stream?streams=<s1>/<s2>/…` (l.41), enveloppe `{"stream":"<nom>","data":<charge>}` (l.42).

  Pour la base des données de marché :
  - la règle des 24 h est écrite pour « stream.binance.com » seul (l.44) ; rien ne l écrit pour `data-stream.binance.vision` ;
  - le ping toutes les 20 s, avec un pong dans la minute (l.46-48), est écrit pour « The WebSocket server », sans hôte nommé ;
  - la limite de 5 messages entrants par seconde, les 1 024 flux et les 300 connexions par 5 minutes et par IP (l.57-63) sont écrits
    pour toutes les connexions WebSocket.

  Lecture : le port de la base des données de marché et la durée de ses connexions ne sont pas écrits ; le plan les tient pour
  inconnus (pas de borne déduite), et P1-a3 les mesure.
- **(b) forme combinée complète sur `/market`** [lu, FWS et FCN] :
  - base `wss://fstream.binance.com`, avec trois chemins routés : `/public`, `/market`, `/private` (FWS l.8-12) ;
  - forme combinée : `wss://fstream.binance.com/market/stream?streams=<s1>/<s2>/…`, exemple écrit en entier (FWS l.15, l.19 ;
    FCN l.27-29) ; enveloppe `{"stream":"<streamName>","data":<rawPayload>}` (FWS l.23) ;
  - une connexion sans chemin routé ne reçoit que le public (FWS l.21) ;
  - `@forceOrder` et `!forceOrder@arr` relèvent de `/market`, la profondeur de `/public` (FCN l.39-55) ;
  - les anciennes URL sans chemin routé étaient annoncées retirées au 2026-04-23 (FCN l.57, l.70) ;
  - autres règles des futures (FWS l.25-29) : connexion valide 24 h, ping toutes les 3 minutes, pong dans les 10 minutes, 10 messages
    entrants par seconde, 1 024 flux.
- **(c) `serverShutdown`** [lu, WS l.45, l.64-90] : forme brute `{"e":"serverShutdown","E":<heure>}` ; en connexion combinée,
  `{"stream":"!serverShutdown","data":{"e":"serverShutdown","E":<heure>}}`. La page ne dit pas s il faut s abonner à
  `!serverShutdown` pour le recevoir (non écrit, jamais déduit). La consigne est d ouvrir une connexion neuve au plus tôt.
- **(d) noms des tableaux de niveaux** [lu] :
  - `depthUpdate` : `"b"` pour les offres d achat, `"a"` pour les offres de vente, avec `"U"`, `"u"`, `"E"` et `"s"` (WS l.609-625).
    Chaque niveau est un tableau `[prix, quantité]` de chaînes.
  - réponse de `GET /api/v3/depth` : `"lastUpdateId"`, `"bids"`, `"asks"`, chaque niveau `[prix, quantité]` en chaînes (REST l.954-965).
    Limite au plus 5 000 ; poids 250 de 1 001 à 5 000 (REST l.936-948).
- **(e) `timeUnit` sur les routes futures** [**non établi**] : aucune mention de `timeUnit` ni de microseconde sur FWS ni sur FCN ; la
  page neuve (FNEW) n est pas lue. Conséquence, par le plan (§3 l.118-120) : aucun `timeUnit` sur `/market`, et les heures de
  `@forceOrder` sont lues dans l unité que ce fait établira. Tant qu il ne l établit pas, un nombre d heure n est jamais converti
  d après sa grandeur. Procurement : lire FNEW par un autre moyen (navigateur externe, ou fichier source de la page). Item
  FAITS-L2-ACCESS-3-E-1, avant le G1 de P1-a4.
- **(f) clés de `rateLimits` et du filtre `PRICE_FILTER`** [lu] :
  - entrée de `rateLimits` : `"rateLimitType"`, `"interval"`, `"intervalNum"`, `"limit"` (ENUM l.137-165 ; `exchangeInfo` y renvoie,
    REST l.816-821 et l.152) ; `rateLimitType` dans `REQUEST_WEIGHT`, `ORDERS`, `RAW_REQUESTS` ; `interval` dans `SECOND`, `MINUTE`,
    `DAY` (ENUM l.168-172) ;
  - `symbols[].filters` porte les filtres, tous facultatifs (REST l.857-860) ;
  - `PRICE_FILTER` : `"filterType"`, `"minPrice"`, `"maxPrice"`, `"tickSize"` (FIL l.53-56).

## Effet sur les lots

- **P1-b1** (PR #112) : (d) et (f) épinglent les noms dont son code dépend. Un autre nom donne l arrêt `exchange_info_shape`, jamais une
  lecture muette. Mon contrôle par diff les compare au code.
- **P1-a3** : (a) est levé ; Q-P1-3 (base réservée aux données de marché) peut se trancher sur ce fait.
- **P1-a4** : (b) et (c) sont levés ; (e) attend FAITS-L2-ACCESS-3-E-1.
