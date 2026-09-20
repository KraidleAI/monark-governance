# L — Lecture PR-B-DBN : API Databento (Historical HTTP, EQUS.SUMMARY, ohlcv-1d) — 2026-09-20

Lecteur `claude-sonnet-5` (effort max, R-1 confirmé), brief fermé C-10 du checkpoint-1 -b3b (`docs/CHECKPOINT1-lot-t1a-ii-b3b.md`). Lecture seule, aucune clé lue, aucun appel authentifié. Transcrit par l'orchestrateur depuis le rapport final du lecteur (fichier de sortie de tâche vide — limite d'outillage, consignée).

**Note méthodologique** : `WebFetch` tronque systématiquement `databento.com/docs/*` (« Content truncated due to length », pages lourdes en JS — limitation d'outillage, pas un paywall). Contournement : `firecrawl_developer_search`, extraits indexés des URLs primaires `databento.com` ; niveau [lu] quand l'extrait provient d'une page `databento.com` (docs, blog, pricing), [2nd] pour un tiers corroborant.

## Q1 — Endpoint et authentification
- [lu] `databento.com/docs/api-reference-historical?historical=http` : clé API = chaîne de 32 caractères préfixée `db-` ; HTTP **basic auth**, clé en username, mot de passe vide (« Appending a colon (:) after `YOUR_API_KEY` prevents `curl` from asking for a password »). En-têtes de sections crawlés : `/metadata.get_cost`, `/timeseries.get_range`.
- Domaine `https://hist.databento.com/v0/…` : **[2nd]** seulement (nautilus_trader, miroir context7) — non vu verbatim sur une page primaire.
- [lu] encodages : DBN (défaut), CSV, JSON ; JSON/CSV sans coût additionnel (`databento.com/pricing`).

## Q2 — Paramètres
- [lu] `dataset` requis ; `schema` optionnel (défaut `trades`) ; `symbols` ≤ **2 000 par requête**, `ALL_SYMBOLS` ou absent = tous ; `stype_in` défaut `raw_symbol`, valeurs `raw_symbol | instrument_id | parent | continuous` ; `start` requis, ISO 8601 ou UNIX ns, **UTC**, inclusif ; `end` optionnel, **exclusif** ; `limit` existe (description tronquée — NON TROUVÉ).
- [lu] « All of our timestamp parameters are start-inclusive and end-exclusive » (standards-and-conventions).

## Q3 — `ts_event` pour `ohlcv-1d`
- [lu] `docs/schemas-and-data-formats/ohlcv` : « The `ts_event` timestamp marks the start of each interval » ; `uint64`, ns UNIX. **« Our `ohlcv-1d` schema is based on UTC dates »** ; exemple CSV : `ts_event=1692576000000000000` = 2023-08-21T00:00:00Z = **minuit UTC de la date du bar**, pas l'ouverture de séance ET.

## Q4 — Encodage / échelle du prix
- [lu] prix = entiers signés fixed-point, **1 unité = 1e-9** (`5411750000000` ↔ 5411.75) ; `int64` ; `UNDEF_PRICE = INT64_MAX`.
- [lu] `blog/CSV-JSON-updates-july-2023` (effectif 2023-07-23) : **« All 64-bit integers will be encoded as strings »** en JSON ⇒ `close` arrive comme **chaîne** contenant l'entier scalé. Paramètre `pretty_px` (JSON) applique l'échelle 1e-9 ; type rendu (chaîne décimale ou nombre) NON TROUVÉ.
- Conséquence C-5 : décoder les deux côtés en entier scalé 1e-9 ; jamais comparer des chaînes brutes (`"364270000000"` vs Massive `"364.27"`).

## Q5 — Champs `ohlcv-1d`
- [lu] exemple CSV : `ts_event,rtype,publisher_id,instrument_id,open,high,low,close,volume,symbol`.
- [lu] en JSON, les champs d'en-tête (`rtype`, `publisher_id`, `instrument_id`, `ts_event`) vivent sous l'objet imbriqué **`hd`** ; `open/high/low/close/volume` à la racine. Table champ-par-champ dédiée `ohlcv-1d` non récupérée verbatim (types déduits des schémas voisins).

## Q6 — Nature du `close` EQUS.SUMMARY, disponibilité, demi-séances
- [lu] `docs/venues-and-datasets/equs-summary` : « Databento normalizes the end-of-day summary provided by the Nasdaq NLS+ feed into the ohlcv-1d schema » ; [lu] `docs/examples/equities/closing-prices` : « Official consolidated end-of-day summary data for all US equities is published by the Nasdaq NLS+ feed » ; volume consolidé toutes places. ⇒ **close = récapitulatif officiel consolidé (H1 confirmée)**, pas un dernier trade calculé.
- [lu] « Databento only provides the last summary (from **20:15 ET**) on the ohlcv-1d schema, which includes the total post-market volume, published as a single OHLCV-1d [tronqué] » ⇒ un enregistrement par jour, récapitulatif 20:15 ET.
- [lu] prix **non ajustés** splits/dividendes.
- Demi-séances : **NON TROUVÉ**.

## Q7 — `metadata.get_cost`
- [lu] endpoint `/metadata.get_cost` ; paramètres `dataset` (requis), `start` (requis), `end`, `symbols` (≤ 2 000), `schema`, `stype_in` ; retour **nombre, USD**. Métadonnées/symbologie/compte **gratuits** ; seule la série temporelle est facturée.

## Q8 — Licence, règle « 24 h »
- [lu] `pricing` FAQ : « Databento doesn't apply any redistribution restrictions » ; « Most of our datasets can be redistributed internally or externally after 24 hours ».
- [lu] `blog/introduction-market-data-licensing` : « Databento users don't need a license to access historical data, which we define as 24 hours into the past » ; [lu] `blog/understanding-exchange-fees` : « Anything T+1 (24 hours and earlier) doesn't require a license ».
- Lecture : seuil ancré sur **l'horodatage de l'événement de marché**, pas sur la disponibilité (20:15 ET) ⇒ cohérent avec C-6 (`refClose 16:00 ET + 24 h`) ; aucune phrase n'adjudique explicitement le cas EQUS.SUMMARY — confirmation partielle.
- [lu] `blog/introducing-databento-us-equities` : « maximizes CTA/UTP SIP coverage without introducing license fees ». Page catalogue EQUS.SUMMARY avec libellé standard de licence : non atteinte.

## Q9 — Batching
- [lu] jusqu'à 2 000 symboles par requête ; une requête `timeseries.get_range` couvre toute la plage `start`/`end` (H2 confirmée). Séparateur virgule en HTTP brut : [2nd] seulement.

## Q10 — Limites et erreurs
- [lu] par IP : 100 connexions concurrentes ; 100 req/s `timeseries` ; 100 req/s `symbology` ; 20 req/s `metadata` ; 20 req/s `batch list jobs`.
- [lu] codes : 400 Bad Request ; 401 clé invalide ; 402 paiement ; 403 permissions ; **404 « resource not found, or a requested symbol does not exist »** ; 409 ; 422 Unprocessable ; 429 rate limit ; 500/503/504.
- [lu] release notes : requête multi-symboles avec symboles non résolus ⇒ **200 + `warnings`** dans le corps. Cas « tous invalides » : NON TROUVÉ.

## NON TROUVÉ (liste fermée)
1. Prix $/GB **spécifique** EQUS.SUMMARY/`ohlcv-1d` — seul chiffre primaire : `databento.com/equities` « Historical … from **$0.40/GB** » (niveau service, pas dataset). **Contradiction à lever avec la décision 53 (« 30 $/GB ») : à trancher par `metadata.get_cost` réel (G1, item C-7).** Un « $4.38 » vu sur Hacker News est exclu (non primaire).
2. Demi-séances EQUS.SUMMARY.
3. Table champ-par-champ `ohlcv-1d` verbatim.
4. Suite de la phrase « published as a single OHLCV-1d […] ».
5. Domaine `hist.databento.com` sur une page primaire.
6. Rendu exact de `pretty_px=true`.
7. Comportement HTTP quand tous les symboles sont invalides.
8. Page catalogue EQUS.SUMMARY (licence).

## Procurement formé (non bloquant pour le G1 ; propriétaire orchestrateur)
Rendu JS ou session navigateur sur : `docs/venues-and-datasets/equs-summary`, `docs/schemas-and-data-formats/ohlcv`, `docs/api-reference-historical/timeseries/timeseries-get-range`, page catalogue EQUS.SUMMARY. Aucune page n'est derrière un paywall ; obstacle = outillage seul.

## Lien avec le checkpoint-1 (signalement)
- C-5 : int64 1e-9, **chaîne** en JSON ⇒ décodage entier scalé des deux côtés.
- C-6 : règle 24 h ancrée sur l'événement ⇒ approche conservatrice conservée ; adjudication EQUS.SUMMARY explicite absente.
- H1 confirmée (close officiel NLS+) ; H2 confirmée (une requête par plage, ≤ 2 000 symboles).

Sources primaires citées (`databento.com`) : `/docs/api-reference-historical`, `/docs/api-reference-historical/basics/rate-limits`, `/docs/venues-and-datasets/equs-summary`, `/docs/schemas-and-data-formats/ohlcv`, `/docs/standards-and-conventions/common-fields-enums-types`, `/docs/standards-and-conventions/symbology`, `/docs/examples/equities/closing-prices`, `/pricing`, `/equities`, `/blog/introducing-databento-us-equities`, `/blog/introduction-market-data-licensing`, `/blog/understanding-exchange-fees`, `/blog/CSV-JSON-updates-july-2023`, `/blog/api-demo-python`, `/docs/release-notes`.
