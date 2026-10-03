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
