# FAITS-L2-ACCESS-2 : relecture fermée des points de place de l ADR-L2-CAPTURE-1, lue sur place le 2026-10-03

Lu par l orchestrateur MONARK (`claude-opus-5-5`, siège tenu par décision de l investisseur, FAITS-L2-ACCESS-1 l.132-136) le
2026-10-03 entre 20:04 et 20:36 UTC (horloge lue avant et après), dans le navigateur interne. Objet : la liste fermée (a) à (k) de
l item FAITS-L2-ACCESS-2 et les points (c) et (d) de FAITS-L2-FUTURES-2 (ADR-L2-CAPTURE-1, §7), avant le plan de P1 (D-26, C-8).
Empreintes : sha256 du texte rendu (`innerText`, UTF-8), calculé dans la page. Citations de 25 mots au plus. Deux lectures de
`exchangeInfo` (spot, un symbole, poids 20 ; futures, poids non lu ici) depuis le poste local en France (pays permis, réponse de
l investisseur du 2026-10-03) : seules les limites de débit, les statuts, les types de contrat et les pas de prix ont été lus ; aucune
valeur de marché.

Sources :
- [WS] https://raw.githubusercontent.com/binance/binance-spot-api-docs/master/web-socket-streams.md, sha256
  `32bf73a0bed3b75e3ca981fdbaf48c53544bbdfb5944ef8ed1c4d7af9aceba0a` (égal à la lecture de 17:57 UTC, FAITS-L2-ACCESS-1 section 1).
- [REST] https://raw.githubusercontent.com/binance/binance-spot-api-docs/master/rest-api.md, sha256
  `49ea6809243fc7fb426e07f2fe662097736c7bb405bd2da5eef637d715427999` (égal au 2026-10-01).
- [FIL] https://raw.githubusercontent.com/binance/binance-spot-api-docs/master/filters.md, sha256
  `4b5a8f0f5d15bcf68fd7ac2059ba6c88da641c06fd7885e642330c5ac8124dd3`.
- [EXS] `GET https://api.binance.com/api/v3/exchangeInfo?symbol=BTCUSDT` et [EXF] `GET https://fapi.binance.com/fapi/v1/exchangeInfo`,
  lus dans le navigateur à 20:3x UTC.
- [LIQ] documentation « legacy » des futures USDⓈ-M, page Liquidation-Order-Streams (lue à 18:0x, FAITS-L2-ACCESS-1 section 3).

## Liste fermée (a) à (k)

- **(a) heure de la place** [lu, REST] : `GET /api/v3/time`, poids 1, rend `serverTime` en millisecondes.
- **(b) plafond de poids** [lu, REST et EXS] : la documentation renvoie au tableau `rateLimits` d `exchangeInfo` ; lu ce jour côté
  spot : `REQUEST_WEIGHT` 6 000 par minute, `RAW_REQUESTS` 300 000 par 5 minutes ; côté futures [EXF] : `REQUEST_WEIGHT` 2 400 par
  minute. L enregistreur lit ce tableau chaque jour au lieu de figer ces nombres.
- **(c) abonnement combiné et `timeUnit`** [lu, WS] : flux combinés sous `/stream?streams=<flux1>/<flux2>/…`, enveloppe
  `{"stream":"<nom>","data":<charge>}`, symboles en minuscules ; heures en millisecondes par défaut, en microsecondes avec le
  paramètre `timeUnit=MICROSECOND` dans l URL. Q-5 de l ADR peut se trancher sur ce fait.
- **(d) heures d événement** [lu, WS] : `depthUpdate` porte `E` (heure d événement) ; `@trade` porte `E` et `T` (heure de transaction) ;
  la charge de `@bookTicker` ne porte AUCUN champ d heure (`u`, `s`, `b`, `B`, `a`, `A` seulement) : le fait cité de mémoire par
  l avis [Ad] est confirmé.
- **(e) quantités des différences** [lu, WS] : chaque niveau porte un prix et une quantité ; la procédure dit de poser la nouvelle
  quantité, et de retirer le niveau si elle vaut zéro : ce sont des quantités ABSOLUES, pas des variations.
- **(f) identifiant de transaction** [lu, WS] : `t` est nommé « Trade ID » ; la page dit chaque transaction à acheteur et vendeur
  uniques, mais ne dit NI que `t` est unique par symbole, NI qu il est consécutif. Non confirmé : limite, item L2-TRADE-ID-CONSEC-1.
- **(g) rattrapage des transactions** [lu, REST] : `GET /api/v3/historicalTrades` (poids 25, `limit` au plus 1 000, `fromId`) et
  `GET /api/v3/aggTrades` (poids 4, `fromId`, `startTime` et `endTime` inclusifs, `limit` au plus 1 000), sous les conditions générales
  déjà lues ; fichiers publics de data.binance.vision sous les conditions Vision (FAITS-L2-ACCESS-1 section 4), admis pour la recherche
  seulement (réponse Q-16 de l investisseur).
- **(h) synchronisation et application** [lu, WS, paraphrase] : synchronisation en sept étapes : (1) ouvrir le flux de différences ;
  (2) tamponner les événements, noter le `U` du premier ; (3) lire un instantané `limit=5000` ; (4) « If the `lastUpdateId` from the
  snapshot is strictly less than the `U` from step 2, go back to step 3 » (l étape de validation citée par [Ad], confirmée) ;
  (5) écarter les événements tamponnés dont `u` ≤ `lastUpdateId` (borne large), le premier restant doit contenir `lastUpdateId` dans
  [`U`;`u`] ; (6) poser le carnet à l instantané, identifiant = `lastUpdateId` ; (7) appliquer la procédure aux événements tamponnés puis
  aux suivants. Application en trois étapes : (1) ignorer l événement si `u` < identifiant local ; si `U` > identifiant local + 1, des
  événements manquent : jeter le carnet et tout reprendre ; normalement `U` = `u` + 1 de l événement précédent ; (2) poser chaque
  quantité, retirer le niveau à zéro ; (3) identifiant local = `u`. Note de la page : l instantané est borné à 5 000 niveaux par côté.
- **(i) messages entrants** [lu, WS] : au plus 5 messages entrants par seconde ; comptent un PING, un PONG et tout message JSON de
  contrôle ; un abonnement par URL (combiné ou brut) n exige aucun message ; le serveur envoie un PING toutes les 20 s, un PONG est dû
  en moins d une minute : la charge entrante en régime est d environ un PONG toutes les 20 s par connexion.
- **(j) `@bookTicker`** [lu, WS] : « Pushes any update to the best bid or ask's price or quantity in real-time » : toute variation du
  prix OU de la quantité du meilleur niveau ; `u` est « order book updateId ». La page ne dit pas qu un `u` est unique par trame :
  limite, item L2-BOOKTICKER-U-1 (le contrôle de trous du meilleur prix repose donc sur l intervalle des différences, pas sur `u`).
- **(k) échelle de prix** [lu, FIL et EXS] : filtre `PRICE_FILTER` d `exchangeInfo`, champ `tickSize` (chaîne décimale ; tout prix
  vérifie `price % tickSize == 0`) ; lu ce jour sur BTCUSDT spot : `0.01000000` ; `LOT_SIZE.stepSize` : `0.00001000`. Ce sont des
  métadonnées d instrument, figées au manifeste du jour (D-10 de l ADR).

## FAITS-L2-FUTURES-2, points (c) et (d) (avant le G1 de P1-a, liquidations dès P1 par la réponse Q-19)

- **(c) `@forceOrder`** [lu, LIQ] : route `/market` (`wss://fstream.binance.com/market/…`) ; champs d heure : `E` (événement) et `o.T`
  (heure de transaction de l ordre) ; au plus une liquidation par symbole et par 1 000 ms (« the largest one ») ; AUCUN identifiant
  d ordre dans la charge : pas de clé de dédoublonnage documentée. Limite, item L2-LIQ-DEDUP-1 (dédoublonner sur le tuple complet de la
  charge, déclaré).
- **(d) quatre perpétuels** [lu, EXF] : `BTCUSDT`, `ETHUSDT`, `BNBUSDT`, `SOLUSDT`, chacun `contractType` `PERPETUAL`, statut
  `TRADING`, actif de cotation `USDT` ; pas de prix lus : `0.10`, `0.01`, `0.010`, `0.0100`.

## Ce que cette lecture change à l ADR (à reporter au plan de P1)

- Confirmés : l étape de validation de l instantané, `@bookTicker` sans heure, l enveloppe combinée, la charge du PONG, `timeUnit`.
- Non confirmés, donc limites avec item (règle C-8) : L2-TRADE-ID-CONSEC-1 (unicité et consécutivité de `t`), L2-BOOKTICKER-U-1
  (unicité de `u` par trame), L2-LIQ-DEDUP-1 (aucune clé de dédoublonnage des liquidations).
- Q-5 de l ADR (microsecondes ou millisecondes) peut se trancher : le paramètre existe et s applique par URL.
