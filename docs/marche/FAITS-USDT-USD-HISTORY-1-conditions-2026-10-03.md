# FAITS-USDT-USD-HISTORY-1 — partie 1 : conditions et points d accès, lus sur place AVANT toute lecture de la série (addendum 4 ADR 0006 §3)

Orchestrateur `claude-opus-5-5` (décision de l investisseur du 2026-10-03). Lu dans le navigateur interne le 2026-10-03 entre 06:52 et
07:05 UTC. Aucune série USDT/USD lue, aucun appel d API de données fait. Citations de 25 mots au plus.

## Place primaire candidate : Kraken, paire USDT/USD (addendum 4 §3 ; message MONARK Q-H1/Q-H2)

- [lu] Point d accès : `GET https://api.kraken.com/0/public/Trades` (docs.kraken.com, page « Get Recent Trades »), paramètres `pair`,
  `since` (« Return trade data since given timestamp »), `count` jusqu à 1000 ; réponse avec un curseur `last`. Un parcours par `since`
  depuis le 2022-09-01 donne donc l historique des transactions, ce dont la lecture de l addendum 4 a besoin (dernier échange avant chaque
  instant de la grille de 15 minutes). Couverture de la paire sur toute la fenêtre 2022-09-01 → 2026-10-01 : à constater par la
  première page de la course, avant tout calcul (non lue ici).
- [lu] Accès : support.kraken.com, article « Public endpoint examples » (mis à jour le 31 mars 2025) : les points de terminaison publics
  « fournissent des données de marché historiques et en temps réel », sans compte requis.
- [lu] Conditions : kraken.com/legal/global-terms, section 8 « Our Content » : « you are permitted to use our services, and Our Content
  made available to you as part of our services, but only for your own benefit » ; « If you wish to use Our Content for any other
  purpose you must seek prior permission » (adresse marketdata@kraken). Aucune page de conditions propre à l API trouvée
  (kraken.com/legal/api-terms rend une page vide).

## Repli : Bitfinex

- [lu] Conditions : bitfinex.com/legal/exchange/terms : droit d usage « personal, restricted, non-exclusive, non-transferable » ;
  « you will not … distribute, or otherwise commercially exploit or make available … all or any part of the Site, Services or IP » sauf
  autorisation expresse. Même ordre de restriction que Kraken. Documentation de l API historique non lue (repli non retenu à ce stade).

## Lecture de l orchestrateur (à trancher par l investisseur, comme la réserve Binance du 2026-10-01)

- L usage prévu est interne : la série sert à poser deux instants par épisode (S et F, addendum 4 §3) ; aucune valeur n est publiée ni
  transférée ; seuls S et F entrent dans la liste historique et dans P0-2. C est la lecture la plus proche de « for your own benefit »,
  mais MONARK est un projet commercial et la liste historique est publique : ce n est pas une certitude.
- Voies : (a) l investisseur juge l usage couvert (comme « on utilise les données à notre guise » pour Binance) et la course part ;
  (b) une demande écrite à marketdata@kraken (message sortant : acte de l investisseur) ; (c) la référence du direct, Pyth USDT/USD,
  en primaire sur la part de la fenêtre où son historique existe (conditions Pyth à lire), Kraken en contrôle.
- En attendant la décision : aucune lecture de la série (règle §10 des préférences et addendum 4 : la source est fixée avant lecture).

## Partie 2 (2026-10-03, 06:57 à 07:12 UTC) : mesure de profondeur Kraken, décision de l investisseur, place retenue : Coinbase

- Décisions de l investisseur, verbatim : « utilise celui qui te parait le plus optimale, ona toutes les autorisations » ; puis « kraken n a
  pas assez d hitorique » ; puis « ok go coinbase ».
- [mesuré] Kraken, trois requêtes `Trades` à `count=1`, horodatage et identifiant seuls (aucun prix lu) : première transaction USDT/USD après
  le 2022-09-01 à 00:00:07.761Z (id 36427824), après le 2025-10-01 à 00:00:07.183Z (id 73314193), après le 2026-10-01 à 00:00:12.435Z
  (id 84055953). L historique des transactions couvre donc la fenêtre ; celui des bougies non : [lu] docs.kraken.com « Historical data » :
  OHLC « Maximum 720 candles per call », « Kraken does not provide a bulk historical data dump ». Coût d un parcours complet des
  transactions : environ 47,6 millions de transactions, environ 48 000 requêtes, rythme sûr « Trades 1–2 seconds » : 13 à 26 heures.
- [lu] Coinbase Exchange, `GET /products/{product_id}/candles` (docs.cdp.coinbase.com, « Get product candles ») : granularité 900 s
  admise ; « The maximum number of data points for a single request is 300 candles » ; bougie = [time, low, high, open, close, volume],
  close = « closing price (last trade) in the bucket interval » ; « No data is published for intervals where there are no ticks » ;
  « Historical rate data may be incomplete » ; des bougies « may precede your declared start value ». Limites [lu] : 10 requêtes par
  seconde par IP, 15 en rafale.
- [lu] Conditions Coinbase : coinbase.com/legal/market_data, « Last updated: August 7, 2026 », inchangées depuis la lecture du
  2026-10-01 (`docs/marche/FAITS-conditions-series-2026-10-01.md` §1) ; l interdit sans accord écrit y est levé par l accord dont le
  fondateur fait état le 2026-10-01 (« on a les accords ») et par la décision de l investisseur ci-dessus ; texte de l accord non vu par MONARK.
- **Place retenue : Coinbase, USDT-USD, bougies de 900 s**, place réglée en dollars bancaires ; environ 470 requêtes pour 2022-09-01 →
  2026-10-01. **Lecture** : à l instant tau de la grille, la lecture est la clôture de la bougie [tau − 15 min, tau) si elle existe, absente
  sinon. **Écart déclaré à l addendum 4 §3** (fenêtre ouverte (tau − 15 min, tau)) : un échange à l instant exact tau − 15 min entre dans la
  bougie ; à soumettre à RECHERCHES avant toute lecture. **Contrôle croisé** : Kraken, transactions, sur les seules heures autour de S et F.
- Ordre : enregistreur Coinbase (G1, patron de l enregistreur Binance), relecture RECHERCHES avant la première requête, course scellée
  par mois, détecteur EE-7 (S, F) ; seuls S et F sortent. Aucune série lue à ce jour.

## Partie 3 (2026-10-03, 07:14 à 07:17 UTC) : Pyth, contrôle croisé de l addendum 4 §3 et de l addendum 5 C5

- Question de l investisseur, verbatim : « est ce que PYTH est vraiment utilisé? il est devenu payant non? ».
- [lu] docs.pyth.network, « Use Historical Price Data (Benchmarks) » : depuis le 26 août 2026 à 16:00 UTC, « every request must include
  an Authorization: Bearer $PYTH_API_KEY header » ; la clé s obtient sur une page de facturation derrière connexion (non ouverte).
- [lu] app.pyth.com/plans, « Plans & Pricing » : l offre Free porte « No Pyth API access » (consultation seule dans le terminal) ; l accès
  API avec clé commence à l offre Starter, « $500/month ».
- Conséquence : l historique Pyth USDT/USD de l addendum 4 §3 et de C5 n est pas accessible sans dépense ni clé ; aucune dépense sans
  l investisseur et l orchestrateur ne détient aucune clé. Le contrôle croisé tenable sans dépense est Kraken seul (transactions, §3).
- Précédent : Shōgen ADR-0023 (2026-09-03) constatait déjà la clé exigée par Hermes depuis le 26 août 2026 ; le contrôle de l addendum 4
  par MONARK (message addendum-4-diff du 2026-10-02) ne l a pas signalé : omission de MONARK.
- Le Dōjō n est pas touché : il lit le compte Pyth SOL/USD sur la chaîne Solana par ses nœuds RPC, sans API Pyth ni clé ; au snapshot
  seq 4, trois des quatre lectures portent le cours SOL/USD (présence comptée, aucune valeur lue).

## Partie 4 (2026-10-03, 08:55 à 08:57 UTC) : bornes des fenêtres de bougies Coinbase (FAITS-COINBASE-CANDLES-1)

- Demande : constat bloquant F-1 de la G2 de COINBASE-USDT-RECORDER-1 (sens des bornes `start` et `end` non lu à la source).
- [lu] docs.cdp.coinbase.com, « Get product candles » (référence de l API Exchange) : `start` et `end` sont des chaînes décrites
  « Timestamp for starting range of aggregations » et « Timestamp for ending range of aggregations » ; la page ne dit ni si les bornes
  sont incluses ou exclues, ni le format exact de l horodatage.
- [lu] même page : « some of those candles may precede your declared start value » ; « more than 300 data points, your request is
  rejected » ; « If the start or end fields are not provided, both fields are ignored » ; « No data is published for intervals where
  there are no ticks » ; « Historical rate data may be incomplete ».
- Conséquence pour l enregistreur : le sens des bornes reste non lu ; la correction le rend indifférent (fenêtres qui se recouvrent
  d au moins un pas, au plus 300 points sous toute lecture des bornes, doublon identique retiré, doublon différent arrêté), et le
  corps de la première réponse d erreur est gardé (il ne porte aucune valeur de série). Aucune requête faite.
