# FAITS — Sources de clôture OFFICIELLE quotidienne (jambe cash MONARK Bell) — alternatives à Databento

**Gate 0 (R-1)** : modèle résolu déclaré par l'agent = « Opus 5.5 (1M context) », identifiant exact `claude-opus-5-5[1m]` ; préfixe attendu `claude-opus-5-5` : **CONFORME**.
**Rôle** : chercheur (lecture de pages seulement). **Aucun appel d'API de données, aucune clé, aucun compte, aucun téléchargement de jeu de données.** Écriture limitée à `F:\tmp\close-sources\`. Aucune écriture sous `F:\Monark*`, aucun commit.
**Début de passe** : 2026-09-23T22:10:42Z (horloge `date -u`). Budget : 40 min.

## 0. Question et périmètre

Question investisseur (2026-09-23) : « y a pas une autre source que Databento ? même gratuite ? ou même payante ? »
Besoin : clôture OFFICIELLE quotidienne (close consolidé, 16:00 ET) de TSLA, AAPL, SPY, NVDA, lue en historique le lendemain, pour publier une VALEUR DÉRIVÉE (écart % prix on-chain vs close) — jamais une redistribution des données.
Six questions par candidat : (1) close officiel/consolidé (SIP) ou dérivé/ajusté ; (2) licence (interne / valeur dérivée publiable / redistribution) avec citation ≤ 25 mots, URL, heure ; (3) coût lu ; (4) délai de disponibilité ; (5) forme d'accès ; (6) provenance attestable.

## 0bis. Contexte interne lu (lecture seule) [lu]

- `F:\Monark\docs\course-bell\FAITS-databento-licence-24h-2026-09-23.md` : EQUS.SUMMARY, historique « Next day 00:00 EST/EDT » sans licence (fiche portail lue par l'orchestrateur/investisseur 18:3x UTC) ; FAQ Databento §1.7 : licence requise pour l'historique si « You plan to redistribute the data » ; offset Bell `earliest_publish_utc = 16:00 ET + 24 h`.
- `F:\Monark\docs\CHANTIERS.md` l.118 (décision 53 : Databento usage-based, EQUS.SUMMARY, OHLCV-1d 30 $/Go, crédits 125 $) ; l.208-209 et l.223 (décision 69 : recoupement Massive autorisé, **jamais nommé sur une surface publique**) ; l.41 (Massive Stocks Starter actif 29 $/m, licence « Individual Use ») ; l.161 (bench 2026-09-19, 11 candidats).
- Bench antérieur `F:\PRODUITS\etude-2026-09-19\sources-web-2026-09-19\cash-close-bench\00-INDEX.md` + `comparatif.csv` (chercheur `claude-sonnet-5`, 2026-09-19) : lu pour orientation SEULEMENT ; chaque fait repris ici est **re-lu sur URL le 2026-09-23** ou marqué comme repris [2nd-interne] (non consommable).
- `F:\Monark\docs\course-bell\FAITS-massive-host-2026-09-23.md` : `api.polygon.io` et `api.massive.com` servis (401 sans clé), doc Massive cite `api.massive.com`.

## Conventions

- Niveaux : [lu] page ouverte et texte lu par cet agent ; [abs] résumé/extrait de moteur de recherche seul ; [2nd] mention secondaire.
- Heures : UTC, horloge de la machine au moment de la lecture (relevé `date -u` par lot de lectures).
- Classes : P1 page officielle du fournisseur ; P2 presse/recherche indépendante ; P3 blog/agrégateur.
- Outil de lecture noté par fait : WF = WebFetch (réponse d'un petit modèle sur la page : verbatim demandé, fidélité à re-vérifier) ; FC = firecrawl_scrape (markdown brut) ; CURL = page HTML brute + grep.

---
(sections candidats ajoutées au fil de l'eau ci-dessous)

## C1. Massive (ex-Polygon.io) — P1 — lu 2026-09-23 22:13-22:14Z (FC)

**Rappel décision 69** : recoupement autorisé en interne, **jamais nommé sur une surface publique**. Cette archive est sous `F:\tmp` (non exportée) ; toute reprise dans un livrable public doit l'anonymiser.

- (2) Licence — `https://massive.com/legal/market-data-terms-of-service` [lu] FC, « Last Updated: August 28, 2025 » :
  - §1 : « limited license to use Market Data exclusively for your personal, non-business, and non-commercial purposes » [lu].
  - §5(c) interdit (sauf consentement écrit préalable de Massive ou accord fournisseur tiers) de transférer à un tiers la donnée « or any data, charts, analytics, research, or other works based on, referring to, or derived from the Market Data » (« Derived Works ») [lu].
  - §2 : « Unless otherwise stated in a subsequent agreement with us or a Third Party Provider, any and all Market Data is strictly for display use only. » [lu]
  - §2 : interdit « publicly displayed … for publication or distribution … without Massive's express prior written consent » (extraits ≤ 25 mots) [lu].
  - §4.2 : réception de données Nasdaq temps réel ⇒ « UTP Plan Subscriber Agreement » ; §4.4 NYSE : « Agreement for Market Data Display Services » (Nonprofessional) ; Schedule 2 §1 NYSE : « Market Data » inclut « (c) all information that derives from any such information » [lu].
  - Lecture : une valeur dérivée publiée = « Derived Works » au sens §5(c) ⇒ interdite **sauf consentement écrit** ; le « feu vert » de la décision 69 n'a de portée probante que s'il est un **écrit de Massive** (procurement P-MAS-1 ci-dessous).
- (3) Coût — `https://massive.com/pricing` [lu] FC : « Stocks Basic … $0/month » (« 5 API Calls / Minute », « 2 Years Historical Data », « End of Day Data ») ; « Stocks Starter … $29/month » (« 15-minute Delayed Data », « 5 Years ») ; Developer « $79/month » ; Advanced « $199/month » ; tous « Individual use » ; « Need data for your business? … View business pricing → » (`massive.com/business`, à lire ci-dessous).
- (1) Nature du close — `https://massive.com/docs/rest/stocks/aggregates/daily-ticker-summary` [lu] FC : endpoint `GET /v1/open-close/{stocksTicker}/{date}` ; champ `close` = « The close price for the symbol in the given time period. » ; `adjusted` défaut `true` (« adjusted for splits ») ; champs `preMarket`, `afterHours` ; « Records date back to September 10, 2003 ». **Aucune mention « official » / « closing auction » / NOCP sur cette page** ⇒ nature officielle du close : **NON TROUVÉ** sur cette page (à ne pas confondre avec « SIP »).
- (4) Délai : Basic « End-of-day » ; Starter/Developer « 15-minute delayed » (même page) [lu].
- (5) Accès : REST, clé `apiKey` en query ou Bearer ; hôte `api.massive.com` [lu] (+ FAITS-massive-host interne).
- (6) Provenance : réponse JSON avec `status`, `symbol`, `from` ; **aucun identifiant de jeu/version** documenté sur cette page [lu] ⇒ NON TROUVÉ.
- Massive Business — `https://massive.com/business` [lu] FC 22:14Z : « Stocks Business … $2,499/month » (« Business use », « No Exchange Fees or Approvals ») ; « Enterprise … Custom » ; expansions « Full Market Delayed … $499 /month » ; « Qualifying startups can get 25% or more off their first year » (email sales@massive.com). **Aucune mention d'un droit d'affichage public/dérivé sur cette page** ⇒ portée « Business use » vis-à-vis d'une publication dérivée : NON TROUVÉ (Business ToS non lu : `massive.com/legal/businesses-terms-of-service`, voir procurement P-MAS-2).

## C2. Databento (usage-based) — P1 — lu 2026-09-23 22:14-22:15Z (FC)

- (3) Coût / (2) licence — `https://databento.com/pricing` [lu] FC :
  - « Sign up today and get $125 in free credits » ; « Credits expire 6 months after signup and each team is eligible for one set of credits. » [lu]
  - Plans affichés (onglet par défaut rendu = **CME**, pas US Equities) : Usage-based « Historical data only » ; Standard « $199 per month » ; Plus « $1,750 license fees per month » (« External distribution », « Annual contract required ») ; Unlimited « $4,500 license fees per month ». **Attention** : l'onglet rendu est CME ; le prix Plus de l'onglet « Databento US Equities » n'est pas rendu dans le markdown — la valeur 1 500 $ lue au portail (décision 53) n'est ni confirmée ni infirmée ici (divergence apparente, non tranchée, cf. §Contradictions).
  - FAQ « Can I redistribute your data? » : « Databento doesn't apply any redistribution restrictions. However, for each dataset, we have to pass through the licensing restrictions from the original publisher. » ; « Most of our datasets can be redistributed internally or externally after 24 hours. » [lu]
  - FAQ coût : « All of our data is priced ($/GB) by the data's uncompressed size (GB) in binary encoding. » ; CSV/JSON « for no additional charge » [lu].
  - « Usage-based live data is not available for Databento US Equities » [lu] (sans effet : Bell lit l'historique).
- (1)(4)(6) — `https://databento.com/docs/venues-and-datasets/equs-summary` [lu] FC :
  - « **Dataset ID**: EQUS.SUMMARY » ; « Nasdaq disseminates consolidated volume and end-of-day statistics via their Nasdaq NLS+ feed. » [lu]
  - « Databento normalizes the end-of-day summary provided by the Nasdaq NLS+ feed into the `ohlcv-1d` schema. » ; summaries NLS+ vers 16:15, 17:00, 20:15 ET ; « Databento only provides the last summary (from 20:15 ET) on the `ohlcv-1d` schema » ; « This can lead to discrepancies when comparing against other data sources that use the other earlier summaries. » [lu]
  - Provenance : `ts_event` (« matching-engine-received timestamp », précision ns) + `ts_recv` (« capture-server-received timestamp ») ; les deux premiers résumés dans `statistics` avec `stat_flags` 1 et 2 [lu].
  - **Le mot « official » n'apparaît pas sur cette page** : le caractère « official close » repose sur la fiche portail (« provides official prices and volumes », lue par l'orchestrateur 18:3x UTC, FAITS interne) et sur la spec NLS+ (à lire ci-dessous, C2bis).
- (4) Délai : fiche portail « Next day 00:00 EST/EDT » (FAITS interne [lu] orchestrateur) ; doc : résumé final 20:15 ET.
- (5) Accès : API historique + batch/flat files, clé ; CSV/JSON/DBN [lu pricing].

### C2bis. Spécification Nasdaq NLS Plus (source amont d'EQUS.SUMMARY) — P1 — lu 2026-09-23 22:15-22:16Z (FC, PDF 63 p., mode directQuote)

URL : `https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NLSPlusSpecification3.0.pdf` (titre « NLS Plus », « Version 3.0 » ; statut HTTP 200, `numPages` 63) [lu, extraction directQuote de l'outil — passages de tableau recopiés par l'outil, pas de lecture page à page par l'agent].
- Message **End of Day Trade Summary** (type `J`/`j`) : « At the close of each trading day, Nasdaq will disseminate the following end of day trade summary messages for all active Nasdaq- and non-Nasdaq-listed securities. » [lu]
- Champ **Consolidated Closing Price** : « The final last sale eligible transaction on Tapes A,B or C received on the trading day. » [lu]
- Message **Adjusted Closing Price** (type `G`/`g`, diffusé « At the start of each trading day ») : « The previous trading day's official closing price adjusted for any applicable corporate actions. » ; « For Nasdaq-listed securities the Nasdaq Official Closing Price will be used to calculate the adjusted close. » ; « For non-Nasdaq securities, the consolidated close will be used to calculate adjusted close. » [lu]
- **Constat porteur pour la question (1)** : par définition de la spec, le close du résumé de fin de journée (celui qu'EQUS.SUMMARY normalise en `ohlcv-1d`, cf. C2) est le **« Consolidated Closing Price » = dernière transaction « last sale eligible » des Tapes A/B/C** — c'est un close **consolidé**, et la spec ne le qualifie **pas** d'« official closing price » (NOCP pour TSLA/AAPL/NVDA ; clôture NYSE Arca pour SPY). La spec réserve le terme « official closing price » au message Adjusted Closing Price, et pour un titre non-Nasdaq (SPY, coté NYSE Arca) elle y utilise « the consolidated close ». Écart pratique entre les deux objets pour les 4 tickers : **NON ÉTABLI** (aucune donnée lue — mesure à faire par l'orchestrateur, procurement P-DBN-2). Divergence de libellé avec la fiche portail Databento « provides official prices » : rapportée, non tranchée (§Contradictions).

### C2ter. Nasdaq Data Link — NLS Plus (même source amont, vendue par Nasdaq) — P1 — lu 22:16Z (FC)

URL : `https://data.nasdaq.com/databases/NLS` [lu].
- Couverture : « Nasdaq Last Sale Plus includes all last sale data, consolidated volume, and end of day summary messaging for U.S. exchange-listed securities » ; transactions : « All trade data from The Nasdaq Stock Market, FINRA/Nasdaq TRF, Nasdaq Texas and Nasdaq PSX » [lu].
- Tables API : `XNDQ/LS`, `XNDQ/LT`, `XNDQ/SST` (Snapshot : `previousClose` = « Adjusted close price for the previous trading day. »), `XNDQ/BARS` (« derived from trades for the specified venue (e.g., Nasdaq) » ⇒ barres **mono-venue**, pas consolidées) [lu].
- Coût : « Log in with your Nasdaq Data Link account to view pricing information » ; « If you are interested in purchasing this product, please contact sales. » ; renvoi à `data.nasdaq.com/price-list` et `data.nasdaq.com/agreements_forms_policies_usage_reporting` [lu] ⇒ prix : **NON TROUVÉ** sans compte.
- Délai / historique : « Delivery Frequency Intraday », « History Rolling Updates » [lu] ; la disponibilité d'un historique EOD du message `J` via ces tables : **NON TROUVÉ**.
- Licence : produit d'échange soumis aux politiques Nasdaq (« subject to such regulatory oversight, as well as the exchange rules and related policies of the exchange ») [lu] ⇒ droits d'affichage dérivé = politiques Nasdaq (C-POL ci-dessous).
- nasdaqtrader NLS Plus (snippet de recherche, [abs]) : « Monthly Data Consolidation Fee … $350 », administration « Nasdaq: $100 / BX: $100 / PSX: $100 », frais d'usage = Nasdaq Last Sale ou Nasdaq Basic — tarif du flux direct, non lu en page.

## C3. Tiingo — P1 — lu 2026-09-23 22:16-22:18Z (FC)

- (2) Licence — `https://app.tiingo.com/tos/` (« Tiingo - Terms of Use », « Last Updated Date: August 5th, 2026 ») [lu, FC directQuote] :
  - Définition : « Data, results, content, or products created through the transformation, analysis, or processing of Tiingo Data are referred to as “Derived Products.” » [lu]
  - Condition (i) : « it is not, and cannot reasonably be used as, a substitute for access to, purchase of, or use of any Tiingo Data or Service » [lu]
  - Condition (ii) : « cannot reasonably be reverse engineered, reconstructed, decoded, disaggregated, matched, combined with other information, or otherwise used to … reproduce any underlying Tiingo Data » [lu] (coupe signalée par « … » : « identify, recover, or »)
  - Exemple « may be permitted » : « percentage returns, growth rates, or percentage changes, provided that their scope, granularity, and presentation do not permit the underlying Tiingo Data to be reconstructed » [lu]
  - Exemple interdit : « returns, differences, ratios, or other calculations supplied with an anchor, reference value, key, lookup table, or sufficiently complete sequence that permits reconstruction » [lu]
  - « A Derived Product that fails either requirement is prohibited unless Company expressly approves it in writing. » [lu]
  - Starter/Trial : « you may not write, save, archive, back up, or otherwise retain Tiingo Data in any persistent or durable storage » [lu] (incompatible avec un bundle Bell rejouable).
  - §7.3 : « All data via the API is for internal consumption only. » ; « Redistribution is only available upon special request and permission, and comes with additional fees. » ; attribution « Data sourced by Tiingo » si redistribution permise [lu].
  - **Lecture (fait documentaire, pas avis juridique)** : le gap % de Bell est publié avec le prix on-chain (une « anchor/reference value ») ⇒ close = p_onchain / (1 + gap) ; c'est le cas nommé dans la liste des exemples **interdits** sauf approbation écrite.
- (3) Coût — `https://www.tiingo.com/about/pricing` [lu] : « $30/month (or $300/year) for individuals and $50/month (or $499/year) for internal commercial use. » ; « Internal use means you may only use the data for your own personal use and you may not display or share the data » [lu].
  - `https://www.tiingo.com/products/end-of-day-stock-price-data` [lu] FC : tableau « Pricing Summary » : Free/Power/Commercial « Internal Use Only » (0 / 30 / 50 $/mois) ; **« EOD + IEX Redistribution — Business — Display Redistribution — $250/month for startups — $500/month for enterprise »**, « Contact sales to get started » [lu]. **Nouveau vs bench 2026-09-19** (qui notait « frais de redistribution non chiffrés ») : un prix public de redistribution-affichage existe (divergence rapportée).
- (1) Nature du close — même page : « Each feed is made up of at least 3 data sources on average. » ; processus « Composite Index » (« combining, refining, cleaning, and joining disparate datastreams ») ; champs « both Raw and Adjusted prices » [lu] ⇒ close **composite/nettoyé par Tiingo**, non qualifié d'« official » ; source SIP/listing : NON TROUVÉ.
- (4) Délai — même page : « 5:30pm EST for Equities/ETFs » ; « Exchange corrections updated throughout the evening until exchange close (8:00 PM EST) » [lu] ; doc `tiingo.com/documentation/end-of-day` (snippet) « Most US Equity prices are available at 5:30 PM EST » [abs].
- (5) Accès : REST `api.tiingo.com/tiingo/daily/<ticker>/prices?startDate=…` (snippet doc) [abs] ; clé requise.
- (6) Provenance : « fully auditable trail to reproduce the price series » (documentation des corrections) [lu] ; identifiant de jeu/version par réponse : NON TROUVÉ.

## C4. EODHD — P1 — lu 2026-09-23 22:17Z (FC directQuote)

- (3)(2) `https://eodhd.com/commercial-pricing` [lu] : « Internal Use € 399.00 /mo. » ; « Enterprise € 2499.00 /mo. » ; « Custom from €399.00/mo. » ; FAQ « Can I share data externally with the internal usage package? » → « Displaying the data or sharing it with individuals outside your company is not permissible under this package. » [lu]. **Devise lue = EUR** (le bench 2026-09-19 notait « 399 $ » : divergence de devise rapportée).
- Droits d'affichage externe de l'offre Enterprise/Custom : NON TROUVÉ sur cette page (directQuote n'a rendu aucune phrase).
- (1)(4)(5)(6) : non relus dans cette passe (budget) — bench 2026-09-19 : « 15 min après close NYSE/NASDAQ », champs `close`/`adjusted_close` [2nd-interne, non consommable] ⇒ procurement P-EOD-1.

## C5. Twelve Data — P1 — lu 2026-09-23 22:17Z (FC directQuote)

- (2) `https://twelvedata.com/terms` (« Last updated: January 1, 2026 ») [lu] :
  - « "Derived Data" means data created by Customer from the Data, provided such data cannot be reverse-engineered to arrive at the underlying Data. » [lu]
  - §2.2(c) : « Create Derived Data that cannot be reverse-engineered to recreate the original Data » [lu]
  - §2.2(e) : « Redistribute or provide external display of Data only if and as expressly authorized by a Redistribution Rights Add-On or separate written agreement » [lu]
  - « "Redistribution" means any publication, distribution, or provision of Data to third parties. » [lu]
  - §2.3(f) interdit : « Create derivative financial products without explicit written permission » ; §2.3(l) : « Use Free Tier data for commercial purposes » [lu].
  - Lecture : comme Tiingo, la dérivée n'est licite sans accord que si elle ne peut pas être « reverse-engineered » — un gap % publié avec le prix on-chain la rend inversible (risque, pas avis juridique).
- (3) Prix du palier d'affichage externe : lu ci-dessous (C5bis) ou NON TROUVÉ.

## C6. Finnhub — P1 — lu 2026-09-23 22:17Z (FC directQuote)

- (2) `https://finnhub.io/terms-of-service` [lu] : « not redistribute or share access to data or derived results from the data obtained from Finnhub with anyone or any 3rd party without written approval » [lu] ; « All plan listed on Finnhub website is strictly for personal use unless explicitly stated otherwise. » ; « Personal plan can’t be used by any business even internally without a written approval. » [lu]. Date de mise à jour : non rendue par l'outil (NON TROUVÉ).
- (3)(1)(4) : non relus (budget) — bench 2026-09-19 : Enterprise ~3 500 $/mois, source du close NON TROUVÉE [2nd-interne] ⇒ écarté pour Bell (dérivé interdit sans accord écrit) ; procurement non requis sauf réouverture.

### C5bis. Twelve Data — prix Business — lu 22:18Z (FC directQuote)
- `https://twelvedata.com/pricing-business` [lu, extraction désordonnée] : « Enterprise … $1,099 » (« $10,992 billed yearly ») avec « External distribution market data » ; « Venture From $149 /mo » ; « Basic … Free … Internal non-display usage ». Le libellé « External display data access » apparaît dans l'extraction mais son **rattachement à Venture ou à Enterprise est ambigu** dans la sortie de l'outil. **Divergence** avec le bench 2026-09-19 (« Venture 499 $/mois, External display data access ») : rapportée, non tranchée ; relecture ciblée C5ter ci-dessous si faite.

## C7. Alpha Vantage — P1 — lu 2026-09-23 22:18Z (FC directQuote)
- (2) `https://www.alphavantage.co/terms_of_service/` (PDF, 4 p., HTTP 200) [lu] : licence « for personal, non-commercial use, unless you and Alpha Vantage have agreed otherwise in writing » ; critère « commercial use » (iii) : « as part of any type of commercial activity that allows individuals or entities other than User to access information » ; « If you are interested in using the Alpha Vantage Platform for commercial purposes, please contact us at: premium@alphavantage.co » [lu]. Date d'effet : « effective as of the date User clicks “Get Free API Key” » ; date de version : NON TROUVÉ.
- (3) `https://www.alphavantage.co/premium/` [lu] : « 75 requests/min + premium support: $49.99/month » … « 1200 requests/min + premium support: $249.99/month » ; seconde grille « 75 requests/min + premium support: $499/month » … « $2499/month » — **libellé de la seconde grille non rendu** (vraisemblablement une grille distincte ; attribution NON TROUVÉE) [lu].
- (1)(4)(6) : nature du close / délai / provenance NON relus cette passe (bench 2026-09-19 : source SIP alléguée par doc tierce [2nd]) ⇒ écarté pour Bell (usage commercial = contrat sur demande).
- Relecture ciblée « Venture » (22:19Z) : **échec outil** (« Query generation failed after all models ») ⇒ prix/attribution du droit d'affichage externe de Twelve Data : ambigu, procurement P-TD-1.

## C8. Cboe DataShop — Equity EOD Summary — P1 — lu 2026-09-23 22:19Z (FC markdown)

URL : `https://datashop.cboe.com/equity-eod-summary` [lu].
- (1) « The ‘close’ represents the last traded price during Regular Trading Hours (RTH) for the symbol. » [lu] ⇒ close = **dernier prix traité RTH calculé par Cboe**, non qualifié d'officiel.
- Fichier supplémentaire : « opening and closing marks for the day per symbol/exchange, and identifies the primary listed market for the underlying » ; champs « Open or Close », « Exchange Id », « Trade Price », « Trade Condition Id », « Primary Exchange » [lu] ⇒ **les marques de clôture par bourse, avec la bourse primaire identifiée, sont fournies** — le print de clôture de la bourse de cotation (NOCP / clôture Arca) y figurerait vraisemblablement ; **non vérifié** (spec `Equity_EOD_Summary_Layout.pdf` non lue — procurement P-CBOE-1).
- Couverture : « U.S. Equities and ETFs primary listed on national equity exchanges (excludes OTC) » ; historique « Available from January 2010 to present » ; « Daily file delivery » [lu].
- (3) Coût : panier dynamique (« Subtotal: $0.00 » avant sélection) ⇒ **NON TROUVÉ** sans configuration du panier (aucune action de panier faite).
- (2) Licence : **aucune clause sur la page produit** Equity EOD Summary ; à titre de comparaison, des pages sœurs DataShop portent « External redistribution of this data is strictly prohibited » (Main Channel EOD Summary, indices) et « Raw data is licensed for internal use only and may not be redistributed externally in any form » (Open-Close Volume Summary, options) [abs, snippets de recherche] ⇒ licence du produit actions : NON TROUVÉ (P-CBOE-1).
- (4) Délai : « Daily file delivery », heure NON TROUVÉE. (5) Fichiers (achat historique ou abonnement ; SFTP/API au compte). (6) Provenance : fichier daté par « Quote Date », identifiant de produit DataShop ; version NON TROUVÉE.

## C9. NYSE — TAQ Closing Prices — P1 — lu 2026-09-23 22:19Z (FC markdown)

URL : `https://www.nyse.com/market-data/historical/taq-nyse-closing-prices` (redirigée vers `…/data-products/catalog/taq-nyse-closing-prices`) [lu].
- (1) « The TAQ Closing Prices files are available each trading day and show the Open/High/Low/Last prices, Total Volume, Closing Bid, Closing Ask, etc. for all NYSE, NYSE American, NYSE Arca, NYSE National, and NYSE Texas securities as of the market close. » [lu] ⇒ couvre les titres **cotés sur les bourses du groupe NYSE** : SPY (coté NYSE Arca) **oui** ; TSLA/AAPL/NVDA (cotés Nasdaq) : **non couverts** par la description (« NYSE … securities ») — à confirmer dans la spec technique (non lue, P-NYSE-1). Le champ « Last » est-il le prix de clôture officiel (enchère) : NON TROUVÉ sur la page.
- Historique « from 1 Nov 2001 - present » [lu] ; achat via `dashboard.theice.com/data/order/buynyseproduct/720704` (« Purchase Now », non ouvert — action de compte) ; prix : **NON TROUVÉ** sur la page ; licence : renvoi à « Data Policies, Contracts & Guidelines » (`nyse.com/market-data/pricing-policies-contracts-guidelines`, non lu — P-NYSE-1).

## C-POL. Politiques d'échange sur la « donnée dérivée » (Nasdaq) — P1 — lu 2026-09-23 22:19-22:20Z (FC directQuote)

- Nasdaq **Global Data Agreement — Terms and Conditions 5.0** (PDF 24 p., `assets.ctfassets.net/.../Global_Data_Agreement_Terms_and_Conditions_5.0_8_15_2025.pdf`, date dans le nom de fichier 8/15/2025) [lu] :
  - §1.8 : « Derived Data » = « information generated in whole or in part from the Information such that the information generated cannot be reverse engineered or decompiled to recreate the Information » (suite : « or be used to create other data that is recognizable as a reasonable substitute ») [lu]
  - §1.18 (extrait) : « Information includes … any element of Information used or processed in such a way that the Information or a substitute for such Information can be identified, recalculated or re-engineered » [lu]
  - « Nasdaq makes no proprietary claim to any Derived Data » [lu].
- nasdaqtrader **Data News #2016-4** (« Thursday, September 1, 2016 », « Nasdaq Basic Derived Data Distribution via a Hosted Solution Policy Change ») [lu] : « Single Security Derived data that contains price data and is based upon a single security symbol is generally fee liable at the underlying product rates. » [lu]
- **Lecture (fait documentaire, pas avis juridique)** : sous les définitions Nasdaq, une valeur publiée à partir de laquelle le close « can be … recalculated or re-engineered » (gap % + prix on-chain publié) relève de l'« Information », pas de la « Derived Data » ; et une dérivée mono-titre contenant du prix est « generally fee liable ». Ce risque est **commun à tous les fournisseurs** dont le close provient de données Nasdaq (EQUS.SUMMARY/NLS+ inclus) ; la règle Databento « 24 h / historique » et la politique amont d'échange ne sont pas articulées par une page lue (procurement P-POL-1). Politiques NYSE/CTA équivalentes : non lues (P-POL-1).

## C10. Yahoo Finance (statut) — P1 (conditions) — lu 2026-09-23 22:21Z (FC directQuote)

- `https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html` (« Yahoo Terms of Service », « Last updated: 4 August 2026 ») [lu] : interdit « access or collect data … from our Services using any automated means … for any purpose without our express, prior permission » ; « Unless otherwise expressly stated, you may not access or reuse the Services, or any portion thereof, for any commercial purpose. » ; interdit de « create derivative works based on, or exploit for any commercial purposes » sans « explicit written permission » [lu].
- API officielle de données : aucune page primaire trouvée (le bench 2026-09-19 le notait [2nd]) ⇒ **écarté** (accès automatisé interdit, usage commercial interdit, aucune provenance attestable).

## C11. Stooq — P3 (site, pas de fournisseur licencié identifié) — vu 2026-09-23 22:21Z (snippets de recherche)

- `https://stooq.com/db/h/` (« Free Historical Market Data - Stooq ») [abs, snippet] : téléchargements gratuits en masse (ASCII/Metastock, « U.S. … daily … 514 MB ») ; « © 2000-2026 Stooq ». **Aucune page de conditions d'usage trouvée** (recherche « stooq terms of use regulamin license ») ; **source amont des prix US, nature du close, droits de republication : NON TROUVÉ**. Aucune donnée téléchargée (règle : pas d'appel de données). ⇒ **écarté** (provenance non attestable, licence inconnue). Procurement non requis (inéligible par construction).

## C12. nasdaq.com (site de la bourse de cotation) — P1 (page) — vu 22:21Z (snippet)

- `https://www.nasdaq.com/market-activity/quotes/historical` [abs] : « Historical data provides up to 10 years of daily historical stock prices and volumes for each stock. » Conditions d'usage du site (accès automatisé, republication) : **non lues** ; la mention « Nasdaq Official Closing Price » sur ces pages : non vérifiée. ⇒ source d'affichage humaine, non un flux licencié ; procurement P-NDQ-WEB-1 si l'orchestrateur veut l'utiliser comme témoin de recoupement manuel.

## C13. SEC/EDGAR, FINRA (sources officielles gratuites) — recherche 2026-09-23 22:21Z

- Recherche « FINRA SEC free official closing price data NMS stocks download end of day consolidated » [abs, snippets] : résultats FINRA = données obligataires (« Fixed Income Data », TRACE historique « 6 months after the transaction date »), « Daily Short Sale Volume Files » (volumes agrégés de ventes à découvert), et `finra-markets.morningstar.com` (« Market Data … This is a free » — affichage tiers). **Aucun jeu de clôtures officielles d'actions NMS publié par la SEC ou FINRA trouvé** ⇒ **NON TROUVÉ** (pas d'inférence au-delà).
- Piste [abs] non lue : Federal Register 2015-05-21 (govinfo `FR-2015-05-21/pdf/2015-12280.pdf`), snippet « End of Day Trade Summary is disseminated at the close of each trading day, free … » (contexte probable : dépôt Nasdaq NLS) — non ouvert (budget) ; P-POL-1.

## C-POL-2. Politique du Plan UTP (SIP des titres cotés Nasdaq : TSLA, AAPL, NVDA) — P1 — lu 2026-09-23 22:22Z (FC directQuote, PDF 32 p.)

URL : `https://www.utpplan.com/DOC/datapolicies.pdf` (« DATA POLICIES », HTTP 200, 32 p.) [lu] :
- « End-of-Day Information » = « Information from the current day that is disseminated both after the market session has closed for the current day and after the Delay Interval. » [lu]
- « Vendors that provide End-of-Day Information on Uncontrolled Products are not fee liable and are not required to obtain a Vendor Agreement from such Recipients. » [lu]
- rubrique « DERIVED DATA: SINGLE SECURITY [FEE LIABLE] » : « Derived Data that contains price data and is based upon a single UTP security symbol is generally fee liable at the underlying product rates. » [lu]
- Snippet de recherche du même PDF [abs] : tableau « End-of-Day | External End-of-Day Redistributor | Not Fee Liable | End-of-Day Usage is not currently fee liable. » ; « Vendors may publish End-of-Day and Historic Information in print media, without restriction on further redistribution » [abs].
- **Portée** : politique du **SIP UTP** (données consolidées). EQUS.SUMMARY provient de **NLS Plus, flux propriétaire Nasdaq** (C2/C2bis), régi par les politiques Nasdaq (C-POL), pas par le Plan UTP : l'exemption « End-of-Day » UTP ne se transpose pas d'office. Articulation « dérivée mono-titre = redevable au tarif du produit sous-jacent » × « produit sous-jacent End-of-Day = non redevable » : **non établie par une page lue** (P-POL-1, question juriste). Politique CTA/CT Plan (SIP des titres NYSE/Arca : SPY) : Federal Register 2026-13215 (ordre SEC du 2026-07-01 sur le barème du CT Plan) — **fetch en échec HTTP 500** ; snippet [abs] : un commentateur « generally supported the non-fee liable treatment of … End-of-Day Redistributor » (P-POL-1).

---

## Contradictions et divergences (rapportées, non tranchées)

1. **« Official » vs « consolidated » (Databento EQUS.SUMMARY)** — fiche portail Databento (lue par l'orchestrateur 18:3x UTC, FAITS interne) : « provides official prices and volumes » ; spec Nasdaq NLS Plus v3.0 (P1, lu 22:15Z) : le close du résumé de fin de journée est le « Consolidated Closing Price » = « The final last sale eligible transaction on Tapes A,B or C received on the trading day », et le terme « official closing price » est réservé au message Adjusted Closing Price (NOCP pour les titres Nasdaq ; « consolidated close » pour les non-Nasdaq). Écart numérique réel : non mesuré.
2. **Redistribution de l'historique (Databento, même éditeur, deux pages P1)** — `databento.com/pricing` FAQ (lu 22:14Z) : « Most of our datasets can be redistributed internally or externally after 24 hours. » ; blog licence §1.7 (lu par l'orchestrateur, FAITS interne) : licence requise pour l'historique si « You plan to redistribute the data ». Libellés divergents ; réconciliation (ex. « redistribuable après 24 h sous licence ») non lue.
3. **Prix Databento Plus** — portail US Equities (décision 53) : 1 500 $/mois ; page `pricing` (onglet rendu = CME) : « $1,750 license fees per month ». Onglet US Equities non rendu ⇒ non comparable en l'état.
4. **Tiingo — frais de redistribution** — bench 2026-09-19 : « non chiffrés » ; page produit EOD (lu 22:16Z) : « Display Redistribution … $250/month for startups … $500/month for enterprise ».
5. **Twelve Data — palier d'affichage externe** — bench 2026-09-19 : « Venture 499 $/mois, External display data access » ; page lue 22:18Z : « Venture From $149 /mo », « Enterprise … $1,099 » avec « External distribution market data » ; rattachement du libellé « External display data access » ambigu.
6. **EODHD — devise** — bench 2026-09-19 : « 399 $ » ; page lue 22:17Z : « € 399.00 /mo. ».

## NON TROUVÉ (consolidé)

- Close qualifié « official » (enchère de clôture de la bourse de cotation) par un fournisseur lu : **aucun** (Massive `close` « for the symbol in the given time period » ; Tiingo composite ; Cboe « last traded price during RTH » ; NLS+ « Consolidated Closing Price ») — seules pistes : fichier supplémentaire Cboe (marques de clôture par bourse + bourse primaire) et message NLS+ « Adjusted Closing Price » (NOCP, diffusé le matin suivant), disponibilité chez Databento non documentée.
- Prix : Nasdaq Data Link NLS (connexion requise), Cboe Equity EOD Summary (panier), NYSE TAQ Closing Prices (achat ICE), Twelve Data (palier exact d'affichage externe), Massive Business (droit d'affichage dérivé).
- Licences : Cboe Equity EOD Summary, NYSE TAQ Closing Prices, Stooq, nasdaq.com, Massive Business ToS, CTA/CT Plan (HTTP 500).
- Délais horaires : Cboe, NYSE, Twelve Data, EODHD, Finnhub, Alpha Vantage, Massive EOD de Basic (« End-of-day » sans heure).
- Identifiants de provenance (jeu/version) : tous sauf Databento (`EQUS.SUMMARY`, schéma, `ts_event`/`ts_recv`).
- Source officielle gratuite SEC/FINRA de clôtures d'actions : aucune trouvée.

---

## Tableau comparatif (état au 2026-09-23 ~22:22Z ; chaque case renvoie à la section Cx)

| # | Candidat (classe) | (1) nature du close | (2) valeur dérivée publiable ? (clause lue) | (3) coût lu | (4) délai | (5) accès | (6) provenance attestable | Niveau |
|---|---|---|---|---|---|---|---|---|
| C2 | **Databento EQUS.SUMMARY** usage-based (P1) | consolidé NLS+ « final last sale eligible transaction on Tapes A,B or C » (portail : « official prices ») | historique next-day sans licence (portail) ; redistribution « after 24 hours » pour « most datasets » (FAQ prix) vs licence si redistribution (FAQ §1.7) ; + politique Nasdaq amont (C-POL) | usage-based ; crédits 125 $ (6 mois) ; OHLCV-1d 30 $/Go (portail, décision 53, non relu ici) | résumé 20:15 ET ; « Next day 00:00 » (portail) | API/batch, clé, CSV/JSON/DBN | **oui** : `EQUS.SUMMARY`, schéma, `ts_event`/`ts_recv` ns | [lu] (+ portail [lu] orchestrateur) |
| C2ter | Nasdaq Data Link — NLS Plus (P1) | même source amont (NLS+) ; barres `XNDQ/BARS` mono-venue | politiques Nasdaq (C-POL) ; contrat | **NON TROUVÉ** (connexion / « contact sales ») | intraday ; historique EOD non documenté | Tables API, clé | tables datées ; version NON TROUVÉE | [lu] |
| C1 | Massive (ex-Polygon) Starter — *recoupement, jamais nommé publiquement* (P1) | `close` « for the symbol in the given time period », ajusté splits par défaut ; « official » NON TROUVÉ | **non** sans consentement écrit (§1, §5(c) « Derived Works ») ; Business : non explicite | Basic 0 $ ; Starter 29 $/mois ; Business 2 499 $/mois | Basic « End-of-day » ; Starter 15 min | REST, clé | réponse JSON sans id de jeu | [lu] |
| C3 | Tiingo (P1) | composite (« at least 3 data sources »), raw + adjusted | **non** sans approbation écrite pour une dérivée inversible (exemple interdit : « calculations supplied with an anchor, reference value ») ; Display Redistribution sur contact | 30 $ (indiv.), 50 $ (interne), **Display Redistribution 250 $/mois startups, 500 $ enterprise** | 17:30 ET ; corrections jusqu'à 20:00 ET | REST, clé | piste d'audit des corrections ; pas d'id | [lu] |
| C5 | Twelve Data (P1) | NON TROUVÉ | « Derived Data » seulement si non « reverse-engineered » ; affichage externe = add-on/palier | Venture « from $149 », Enterprise « $1,099 » (rattachement du droit ambigu) | NON TROUVÉ | REST, clé | NON TROUVÉ | [lu] partiel |
| C4 | EODHD (P1) | NON relu (bench : `close`/`adjusted_close`) | Internal Use : affichage externe interdit ; Enterprise : NON TROUVÉ | € 399 / € 2 499 par mois | NON relu | REST, clé | NON TROUVÉ | [lu] partiel |
| C6 | Finnhub (P1) | NON relu | **non** : « derived results » interdits sans approbation écrite | NON relu | NON relu | REST | NON TROUVÉ | [lu] |
| C7 | Alpha Vantage (P1) | NON relu | usage commercial = contrat sur demande | 49,99 à 249,99 $ ; 2ᵉ grille 499 à 2 499 $ (libellé non rendu) | NON relu | REST | NON TROUVÉ | [lu] |
| C8 | Cboe DataShop Equity EOD Summary (P1) | « last traded price during RTH » + **fichier des marques de clôture par bourse, bourse primaire identifiée** | NON TROUVÉ sur la page produit | NON TROUVÉ (panier) | « Daily file delivery » | fichiers (historique/abonnement) | fichier daté ; version NON TROUVÉE | [lu] |
| C9 | NYSE TAQ Closing Prices (P1) | « Open/High/Low/Last » « as of the market close », **titres cotés NYSE-group seulement** (SPY oui ; TSLA/AAPL/NVDA non) | NON TROUVÉ | NON TROUVÉ (achat ICE) | chaque jour de bourse | fichiers | NON TROUVÉ | [lu] |
| C10 | Yahoo Finance (statut) | — | **non** (accès automatisé et usage commercial interdits, ToS 4 Aug 2026) | — | — | pas d'API officielle | aucune | [lu] |
| C11 | Stooq (P3) | NON TROUVÉ | conditions NON TROUVÉES | gratuit (téléchargements en masse) | NON TROUVÉ | CSV/ASCII | aucune | [abs] |
| C13 | SEC/EDGAR, FINRA | aucun jeu de clôtures d'actions trouvé | — | — | — | — | — | [abs] |
| C-POL-2 | Plan UTP (SIP, cadre et non fournisseur) | — | End-of-Day sur produits non contrôlés : « not fee liable » ; dérivée mono-titre avec prix : « generally fee liable at the underlying product rates » | — | après clôture + « Delay Interval » | — | — | [lu] |

## Recommandation argumentée (données brutes pour l'orchestrateur ; aucun verdict)

**Réponse courte à l'investisseur** : oui, il existe d'autres sources — gratuites (Massive Basic, Stooq, Yahoo) et payantes (Tiingo, Twelve Data, EODHD, Finnhub, Alpha Vantage, Cboe DataShop, NYSE TAQ, Nasdaq Data Link) — mais **aucune** ne documente, sur les pages lues le 2026-09-23, les trois conditions à la fois : (a) close étiqueté officiel, (b) clause autorisant la publication externe d'une valeur dérivée **inversible** au palier nommé, (c) identifiant de provenance. Les gratuites sont exclues par leurs propres conditions (usage personnel, accès automatisé interdit) ou n'ont pas de conditions trouvées (Stooq).

**Source primaire : rester sur Databento EQUS.SUMMARY (usage-based)**, parce que c'est le seul candidat qui cumule : provenance attestable forte (`EQUS.SUMMARY`, schéma `ohlcv-1d`, `ts_event`/`ts_recv`), accès historique sans licence (lecture portail), clause « redistributed … after 24 hours » affichée par l'éditeur, et coût quasi nul. **Deux corrections documentaires à reporter dans Bell**, sans changer de fournisseur :
1. **Libellé** : d'après la spec Nasdaq NLS Plus, ce close est le « Consolidated Closing Price » (dernière transaction « last sale eligible » des Tapes A/B/C), non la clôture officielle de la bourse de cotation. Toute surface Bell qui dirait « official close » devrait dire « consolidated close (Nasdaq NLS+ end-of-day summary) » tant que l'égalité avec NOCP / clôture Arca n'est pas mesurée (P-DBN-2).
2. **Inversibilité** : gap % + prix on-chain publié ⇒ close = p_onchain / (1 + gap). Selon les définitions Nasdaq (C-POL) et UTP (C-POL-2), une telle valeur ne répond pas à la définition de la « Derived Data » (non inversible) ; Bell ne peut donc pas invoquer le seul caractère « dérivé » ; la base qui reste est la **règle historique/24 h de Databento** (déjà retenue par l’offset `16:00 ET + 24 h`), sous réserve de P-DBN-1 (fait documentaire, pas avis juridique). La décision d'arrondir ou de publier sans ancre relève du produit, pas de ce chercheur.

**Recoupement** : (i) **Massive Starter, en interne seulement**, jamais nommé sur une surface publique (décision 69) : déjà payé (29 $/mois), mais son `close` n'est pas étiqueté officiel et ses conditions publiques interdisent les « Derived Works » sans consentement écrit (le feu vert doit être un écrit : P-MAS-1). (ii) **Option à instruire, pas à recommander** : fichier supplémentaire de Cboe DataShop Equity EOD Summary (marques de clôture par bourse + bourse primaire) pour vérifier, en interne et une seule fois, l'écart entre close consolidé et clôture de la bourse de cotation pour les 4 tickers (P-CBOE-1 ; prix et licence NON TROUVÉS).

**Repli payant si Databento échoue** (non recommandé en l'état, conditions non levées) : Tiingo « Display Redistribution » **250 $/mois (startups)** — seul prix public lu pour un droit d'affichage — **mais** ses conditions citent justement comme exemple interdit la dérivée inversible avec ancre, sauf approbation écrite (P-TNG-1) ; puis Twelve Data Enterprise (1 099 $/mois, « External distribution ») sous la même réserve « reverse-engineered » ; Massive Business (2 499 $/mois) et EODHD Enterprise (€ 2 499/mois) sans droit d'affichage dérivé lu.

**Risques** :
- *Licence* : (R1) inversibilité du gap (tous fournisseurs, politiques Nasdaq/UTP) ; (R2) libellés divergents Databento sur la redistribution d'historique (contradiction 2) ; (R3) chaîne propriétaire NLS+ ≠ SIP : l'exemption UTP « End-of-Day » ne s'applique pas d'office ; (R4) Massive : la licence publique interdit la dérivée, et le feu vert n'est probant que s'il est écrit.
- *Provenance* : (R5) close consolidé ≠ close officiel par définition (spec NLS+), écart non mesuré ; (R6) Databento ne livre que le résumé de 20:15 ET (« discrepancies » possibles avec des sources qui utilisent 16:15/17:00) ; (R7) les recoupements (Massive, Tiingo) n'ont pas d'identifiant de jeu/version : témoins internes seulement.
- *Coût* : (R8) le prix Plus Databento lu diffère selon la page (1 500 $ portail vs 1 750 $ onglet CME) — sans effet tant que l'usage-based suffit ; (R9) crédits de 125 $ : « Credits expire 6 months after signup » (compte ouvert le 2026-09-20 selon la décision 53 ⇒ vers le 2027-03-20 si la règle s'applique au compte ; date exacte non lue) ⇒ facturation à l'usage ensuite (montant négligeable selon la décision 53, non relu ici).

## Procurements formés (propriétaire → objet → tentatives → usage)

- **P-DBN-1** (investisseur → Databento, écrit) : pour `EQUS.SUMMARY`, confirmer si publier une valeur mono-titre inversible (gap % + prix on-chain public) à partir de 00:00 ET J+1 + 16 h est une « redistribution » soumise à licence ; réconcilier la FAQ prix (« after 24 hours ») et le blog licence §1.7 ; donner le prix Plus de l'onglet US Equities. Tentatives : pages `databento.com/pricing` et `databento.com/docs/venues-and-datasets/equs-summary` lues (22:14Z) ; blog licence et portail lus par l'orchestrateur/investisseur (FAITS interne). Brouillon existant à mettre à jour : `F:\PRODUITS\etude-2026-09-19\sources-web-2026-09-19\cash-close-bench\mail-databento-2026-09-19.md`. Usage : lever R1/R2 avant la jambe cash rallumée.
- **P-DBN-2** (orchestrateur, lecture de doc puis mesure interne) : lire `https://databento.com/docs/schemas-and-data-formats/statistics` pour savoir si le message NLS+ « Adjusted Closing Price » (NOCP) est normalisé dans `statistics` d'EQUS.SUMMARY ; mesurer l'écart close consolidé vs NOCP sur les 4 tickers (données internes, après lecture des conditions). Usage : trancher le libellé « official » vs « consolidated » (R5).
- **P-MAS-1** (investisseur) : déposer l'écrit du feu vert Massive (décision 69) dans `F:\PRODUITS\etude-2026-09-20\procurements\recus\`, sinon envoyer `MAIL-MASSIVE-brouillon.md`. Usage : base écrite du « express prior written consent » (§2, §5 des conditions Massive du 2025-08-28).
- **P-MAS-2** (chercheur, lecture) : `https://massive.com/legal/businesses-terms-of-service` (non ouvert cette passe) — droit d'affichage/dérivée du plan Business.
- **P-TNG-1** (investisseur → sales@tiingo.com) : approbation écrite d'un « Derived Product » inversible (gap % avec ancre on-chain) et devis « Display Redistribution » 250 $/mois ; tentatives : conditions (Last Updated 2026-08-05) et page produit EOD lues à 22:16-22:17Z. Usage : repli payant.
- **P-TD-1** (chercheur, relecture) : `https://twelvedata.com/pricing-business` — palier portant « External display data access » et prix (Venture 149 $ lu vs 499 $ du bench) ; tentative ciblée 22:19Z en échec (« Query generation failed after all models »).
- **P-EOD-1** (chercheur) : EODHD Enterprise — droit d'affichage externe ; nature du close ; heure de disponibilité (`eodhd.com/financial-apis/api-for-historical-data-and-volumes` + conditions d'usage EODHD).
- **P-CBOE-1** (chercheur puis investisseur) : `https://datashop.cboe.com/documents/Equity_EOD_Summary_Layout.pdf` (spec), conditions DataShop, prix historique pour 4 symboles ; usage : recoupement ponctuel du close de la bourse de cotation.
- **P-NYSE-1** (chercheur) : spec technique TAQ Closing Prices (`https://www.nyse.com/market-data/technical-documents#non-real-time`), page « Data Policies, Contracts & Guidelines », prix (achat ICE non ouvert : action de compte).
- **P-POL-1** (juriste de l'investisseur + chercheur) : Federal Register 2026-13215 (HTTP 500 à 22:20Z ; retenter via le PDF govinfo), politique CTA équivalente, Federal Register 2015-12280 ; question au juriste : l'exemption « End-of-Day » (UTP) et la règle « dérivée mono-titre redevable au tarif du produit sous-jacent » s'appliquent-elles à un flux propriétaire (NLS+) revendu par un tiers ?
- **P-NDL-1** (investisseur, compte) : prix Nasdaq Data Link NLS (`https://data.nasdaq.com/price-list`, connexion requise).
- **P-NDQ-WEB-1** (chercheur) : conditions d'usage de nasdaq.com si la page « Historical Data » doit servir de témoin manuel.

## Journal de méthode

- Outils : firecrawl_scrape (markdown, ou `query` en mode `directQuote` : l'outil renvoie des passages recopiés — fidélité à re-vérifier par l'orchestrateur sur les clauses porteuses), firecrawl_search (snippets = [abs]). WebFetch/WebSearch chargés, non utilisés.
- **Aucun appel d'API de données**, aucune clé, aucun compte, aucun panier, aucun téléchargement de jeu (Stooq, Cboe « Download sample » et NYSE « Sample Data » non ouverts).
- Advisor intégré : **un appel AVANT toute extraction externe** (transcript = fichiers internes seulement), pour la stratégie de lecture ; **aucun appel pendant ni après l'extraction** (règle filtre de régurgitation, CLAUDE.md 2026-09-05) ⇒ la revue finale passe par une demande de consultation formée routée par l'orchestrateur (voir le rapport de retour).
- Citations : ≤ 25 mots ; six citations d'abord trop longues (Alpha Vantage, Nasdaq GDA §1.8, NLS+ Adjusted Closing Price, UTP dérivée mono-titre, Finnhub, Tiingo (ii)) ont été raccourcies à 22:27Z, coupes marquées « … ».
- Fin de passe : horodatage `date -u` en fin d'archive.

**Fin de passe (horloge)** : 2026-09-23T22:23:35Z

---

## ADDENDUM (lectures 22:24-22:27Z, après la première rédaction) — complète et, où indiqué, SUPERSÈDE les cases ci-dessus

### A1. Databento — blog licence relu par cet agent — P1 — lu 22:24Z (FC dQ)
`https://databento.com/blog/introduction-market-data-licensing` (« Part 1: Introduction to market data licensing ») [lu, ma propre lecture ; auparavant [lu] orchestrateur seulement] :
- §1.1 : « You do NOT need a license to access historical (T+1) data. » [lu]
- §1.7 : « Databento users don't need a license to access historical data, which we define as 24 hours into the past. » ; cas où la licence reste requise : « You plan to redistribute the data. » [lu]
- §1.7 : « Some define "historical" as 24 hours into the past, while others define "historical" as right after the market session ends. » [lu]
⇒ la **contradiction 2** (FAQ prix « can be redistributed … after 24 hours » vs §1.7 « license … You plan to redistribute ») est confirmée en première main.

### A2. Databento — schéma `statistics` — P1 — lu 22:24Z (FC dQ)
`https://databento.com/docs/schemas-and-data-formats/statistics` [lu] :
- `stat_type` 11 « Close price » : « The last trade price and quantity during a trading session. » [lu]
- « these are official summary statistics provided by the venue—Databento doesn't compute these statistics. » [lu]
- Tableau de disponibilité par jeu : `ARCX.PILLAR`, `XNAS.ITCH`, `XNAS.BASIC`, `XNYS.PILLAR`, `XASE.PILLAR`, `XCHI.PILLAR`, etc. sont listés ; **`EQUS.SUMMARY` n'y figure pas** [lu] (les colonnes exactes cochées par jeu ne sont pas lisibles dans l'extraction : quels `stat_type` pour `ARCX.PILLAR`/`XNAS.ITCH` = NON TROUVÉ).
- Piste (non instruite) : les statistiques officielles de la **bourse de cotation** (`XNAS.ITCH` pour TSLA/AAPL/NVDA ; `ARCX.PILLAR` pour SPY) pourraient porter une clôture officielle venue ; licences de ces jeux non lues ⇒ P-DBN-2 élargi.

### A3. Massive — conditions « Businesses » — P1 — lu 22:24Z (FC dQ) — **ferme P-MAS-2**
`https://massive.com/legal/businesses-terms-of-service` (« Massive for Businesses Terms of Service ») [lu] : droit d'usage « solely for Customer's internal purposes » ; interdit de « redistribute … display, disseminate, … publish … any portion of the Information to anyone other than Customer, its Authorized Users, or its Edge Users » ; interdit « derivative works … based on the Information unless licensed to do so » [lu]. Date de mise à jour : non rendue. Définition d'« Edge Users » : NON TROUVÉE. ⇒ le plan Business (2 499 $/mois) ne donne **pas**, sur ses conditions publiques, de droit de publication d'une valeur dérivée.

### A4. Cboe DataShop — spec, politiques, contrat de licence — P1 — lu 22:24-22:27Z (FC dQ, PDF)
- **Spec** `https://datashop.cboe.com/documents/Equity_EOD_Summary_Layout.pdf` (2 p.) [lu] :
  - `close` : « Closing trade price of the day. Closing time window is extended until 16:10 U.S. Eastern to account for closing auctions. » [lu]
  - `primary_exchange_ind` : « The Open and Close messages sent by the primary exchange are the official prices for an underlying security. » [lu]
  - Note : « The official close price for a security can be determined by locating the closing print from the primary exchange with trade_condition_id = 63 (MarketOnClose). » [lu]
  - ⇒ **Seul fournisseur lu qui documente la clôture OFFICIELLE** (print de clôture de la bourse primaire, condition 63), distincte du `close` « closing trade price of the day ».
- **Contrat** `https://datashop.cboe.com/documents/Cboe_LiveVol_DataShop_License_Agreement.pdf` (« Cboe LiveVol DataShop License Agreement », 16 p.) [lu] :
  - Octroi : « Subscriber shall only use the Services for its internal purposes in the ordinary course of its business » ; divulgation permise de « nominal elements or extracts of the applicable Data and/or Derived Data … in written materials » à ses clients [lu].
  - Redistribution d'historique : « Only where the option to redistribute data is available on DataShop for a specific dataset » ; alors « Display redistribution of Derived Data is also permitted » [lu].
  - §6 Derived Data : « any works so created that display, represent or recreate any Data, or from which Data can be readily recalculated, will constitute Data » [lu] (même règle d'inversibilité).
  - Durée : « non-index Data provided by Cboe pursuant to an Order is licensed to Subscriber in perpetuity » ; pas d'obligation de suppression à la résiliation pour ces données [lu] ⇒ **archivage/rejeu Bell possible** (atout de provenance).
- **Politiques** `https://datashop.cboe.com/documents/DataShop_Policies_for_Historical_Data_Services.pdf` (5 p.) [lu] : « Subscriber’s rights and obligations with respect to use and/or distribution of Data are subject to the requirements of the Data owner/provider » [lu].
- **Option de redistribution du produit Equity EOD Summary** : la page produit lue (C8) ne propose **aucune** option « Redistribution » dans le formulaire d'achat (options vues : Historical/Subscription, symboles, dates, période, regroupement, CGI Licensed/Unlicensed), alors qu'une page sœur (options Open-Close) propose « Internal Use Only / Internal Use + External Distribution of Derived Data » [abs, snippet] ⇒ pour ce produit, **usage interne seulement** en l'état de la page (à confirmer : P-CBOE-1).
- Page « Cboe All Access API » [abs, snippet] : « Redistribution rights for SIP data must be obtained directly from the appropriate SIP data provider. »

### A5. Mises à jour du tableau comparatif (supersèdent les cases correspondantes)
- **C8 Cboe** — (1) **clôture officielle documentée** (print de clôture de la bourse primaire, `trade_condition_id = 63`) + `close` « closing trade price » (fenêtre jusqu'à 16:10 ET) ; (2) usage **interne** + extraits nominaux ; publication d'une dérivée inversible = « Data » ; option de redistribution non proposée pour ce produit (page) ; (3) prix NON TROUVÉ (panier) ; (6) **licence perpétuelle** sur les données achetées (archivage/rejeu), fichiers datés par `quote_date`. Niveau [lu].
- **C1 Massive** — Business : « internal purposes », dérivées interdites « unless licensed » [lu] (P-MAS-2 fermé).
- **C2 Databento** — `statistics` : `EQUS.SUMMARY` absent du tableau de disponibilité ⇒ la clôture officielle (NOCP) n'est pas documentée comme disponible dans ce jeu ; seul le close consolidé (`ohlcv-1d`) l'est.

### A6. Recommandation — mise à jour
- **Source primaire publiée : inchangée** (Databento EQUS.SUMMARY, sous les deux corrections « consolidated close » et « inversibilité », et P-DBN-1).
- **Recoupement de la nature « officielle »** : Cboe DataShop Equity EOD Summary devient le **meilleur témoin interne documenté** de la clôture officielle (print MOC de la bourse primaire, condition 63), avec licence perpétuelle ⇒ archivable et rejouable ; usage interne seulement (pas de publication). Il sert à mesurer, pour les 4 tickers, l'écart close consolidé (Databento) vs clôture officielle (Cboe) — c'est la mesure P-DBN-2, faisable sans publier Cboe. Coût : NON TROUVÉ (P-CBOE-1).
- **Massive** : reste un recoupement interne, non nommé publiquement (décision 69) ; il n'apporte pas la nature « officielle » (close non étiqueté).
- **Procurements mis à jour** : P-MAS-2 **fermé** (A3) ; P-CBOE-1 réduit à : prix d'un achat historique (4 symboles) + confirmation écrite qu'aucune option de redistribution n'existe pour Equity EOD Summary ; P-DBN-2 élargi : colonnes `stat_type` de `XNAS.ITCH`/`ARCX.PILLAR` + licences de ces jeux.

**Horodatage de fin d'addendum** : voir la ligne suivante (horloge).
**Fin d'addendum (horloge)** : 2026-09-23T22:26:15Z
