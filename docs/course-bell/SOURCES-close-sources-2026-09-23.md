# SOURCES — journal des URL (succès ET échecs) — passe close-sources 2026-09-23

Format : heure UTC | outil | URL | résultat (HTTP/erreur) | classe | usage

Agent : chercheur, modèle déclaré `claude-opus-5-5[1m]` (préfixe attendu `claude-opus-5-5` : conforme). Passe du 2026-09-23, 22:10:42Z → 22:23:35Z (horloge `date -u`). FC = firecrawl_scrape ; FS = firecrawl_search (snippets = [abs]) ; dQ = mode `query/directQuote`.

## Pages lues (succès)

| Heure UTC | Outil | URL | Résultat | Classe | Usage (section) |
|---|---|---|---|---|---|
| 22:13 | FC markdown | https://massive.com/legal/market-data-terms-of-service | 200, « Last Updated: August 28, 2025 » [lu] | P1 | C1 licence |
| 22:13 | FC markdown | https://massive.com/pricing | 200 [lu] | P1 | C1 coût |
| 22:13 | FC markdown | https://massive.com/docs/rest/stocks/aggregates/daily-ticker-summary | 200 [lu] | P1 | C1 nature du close |
| 22:14 | FC markdown | https://massive.com/business | 200 [lu] | P1 | C1 Business |
| 22:14 | FC markdown | https://databento.com/pricing | 200 [lu] (onglet rendu = CME) | P1 | C2 |
| 22:14 | FC markdown | https://databento.com/docs/venues-and-datasets/equs-summary | 200 [lu] | P1 | C2 |
| 22:15 | FC dQ + parser PDF | https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NLSPlusSpecification3.0.pdf | 200, 63 p. [lu dQ] | P1 | C2bis |
| 22:16 | FC markdown | https://data.nasdaq.com/databases/NLS | 200 [lu] | P1 | C2ter |
| 22:16 | FC dQ (×2) | https://app.tiingo.com/tos/ | 200, « Last Updated Date: August 5th, 2026 » [lu dQ] | P1 | C3 |
| 22:16 | FC dQ | https://www.tiingo.com/about/pricing | 200 [lu dQ] | P1 | C3 |
| 22:17 | FC markdown | https://www.tiingo.com/products/end-of-day-stock-price-data | 200 [lu] | P1 | C3 |
| 22:17 | FC dQ | https://eodhd.com/commercial-pricing | 200 [lu dQ] | P1 | C4 |
| 22:17 | FC dQ | https://twelvedata.com/terms | 200, « Last updated: January 1, 2026 » [lu dQ] | P1 | C5 |
| 22:17 | FC dQ | https://finnhub.io/terms-of-service | 200 [lu dQ] | P1 | C6 |
| 22:18 | FC dQ | https://twelvedata.com/pricing-business | 200 [lu dQ, extraction désordonnée] | P1 | C5bis |
| 22:18 | FC dQ | https://www.alphavantage.co/premium/ | 200 [lu dQ] | P1 | C7 |
| 22:18 | FC dQ + parser PDF | https://www.alphavantage.co/terms_of_service/ | 200, PDF 4 p. [lu dQ] | P1 | C7 |
| 22:19 | FC markdown | https://datashop.cboe.com/equity-eod-summary | 200 [lu] | P1 | C8 |
| 22:19 | FC markdown | https://www.nyse.com/market-data/historical/taq-nyse-closing-prices (→ /data-products/catalog/taq-nyse-closing-prices) | 200 [lu] | P1 | C9 |
| 22:19 | FC dQ + parser PDF | https://assets.ctfassets.net/mx0rke14e5yt/6DYAXkkVqSVwEZVvOMLJwN/5ba36a22dd18d28845837b2bb83c6fc9/Global_Data_Agreement_Terms_and_Conditions_5.0_8_15_2025.pdf | 200, 24 p. [lu dQ] | P1 | C-POL |
| 22:19 | FC dQ | https://www.nasdaqtrader.com/TraderNews.aspx?id=dn2016-04 | 200, « September 1, 2016 » [lu dQ] | P1 | C-POL |
| 22:20 | FC dQ | https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html | 200, « Last updated: 4 August 2026 » [lu dQ] | P1 | C10 |
| 22:20 | FC dQ + parser PDF | https://www.utpplan.com/DOC/datapolicies.pdf | 200, 32 p. [lu dQ] | P1 | C-POL-2 |

## Échecs, refus, non-ouvertures

| Heure UTC | Outil | URL | Résultat | Suite |
|---|---|---|---|---|
| 22:14 | FC (formats objet) | NLSPlusSpecification3.0.pdf | **ÉCHEC** : validation du paramètre `formats` (objet refusé) | relancé en `formats:["query"]` : succès |
| 22:19 | FC dQ | https://twelvedata.com/pricing-business (question « Venture ») | **ÉCHEC** : « Query generation failed after all models » | P-TD-1 |
| 22:20 | FC dQ | https://www.federalregister.gov/documents/2026/07/01/2026-13215/joint-industry-plan-order-approving-the-second-amendment-to-the-national-market-system-plan | **HTTP 500** « Internal Server Error » | P-POL-1 (retenter via govinfo) |
| — | non ouvert | https://massive.com/legal/businesses-terms-of-service | budget | P-MAS-2 |
| — | non ouvert | https://datashop.cboe.com/documents/Equity_EOD_Summary_Layout.pdf ; « Download sample » | budget ; échantillon = téléchargement de données (interdit) | P-CBOE-1 |
| — | non ouvert | https://dashboard.theice.com/data/order/buynyseproduct/720704 ; https://ftp.nyse.com/Historical%20Data%20Samples/ | action de compte / téléchargement de données | P-NYSE-1 |
| — | non ouvert | https://data.nasdaq.com/price-list | connexion requise (annoncé par la page NLS) | P-NDL-1 |
| — | non ouvert | https://databento.com/docs/schemas-and-data-formats/statistics | budget | P-DBN-2 |
| — | non ouvert | https://www.govinfo.gov/content/pkg/FR-2015-05-21/pdf/2015-12280.pdf | budget | P-POL-1 |
| — | non ouvert | pages de téléchargement Stooq (`stooq.com/db/d/...`) | téléchargement de données (interdit) | inéligible |

## Recherches (snippets [abs], jamais utilisés comme preuve terminale)

| Heure UTC | Outil | Requête | Pistes retenues |
|---|---|---|---|
| 22:14 | FS | Nasdaq Last Sale Plus NLS Plus consolidated end of day summary official closing price all U.S. exchanges | data.nasdaq.com/databases/NLS ; nasdaqtrader NLS Plus (tarifs du flux direct [abs]) ; spec PDF |
| 22:16 | FS | site:tiingo.com end-of-day prices official close exchange time available EOD data documentation | tiingo.com/documentation/end-of-day (« available at 5:30 PM EST » [abs]) ; page produit EOD |
| 22:18 | FS | Cboe DataShop U.S. equities end of day summary official closing price historical data license | datashop.cboe.com/equity-eod-summary ; pages sœurs (clauses de redistribution [abs]) |
| 22:18 | FS | NYSE market data historical closing prices product official closing price file NYSE Group | nyse.com/market-data/historical (TAQ Closing Prices) |
| 22:18 | FS | Nasdaq Global Data Policies "Derived Data" definition cannot be reverse engineered original data | Global Data Agreement T&C 5.0 ; Data News 2016-4 ; formulaire Derived Data (non ouvert) |
| 22:19 | FS | UTP Plan CTA Plan delayed data historical end of day data redistribution no fees policy "end-of-day" | utpplan.com/DOC/datapolicies.pdf ; Federal Register 2026-13215 [abs] |
| 22:19 | FS | stooq.com terms of use regulamin data download historical quotes license commercial use | stooq.com/db/h/ (aucune page de conditions trouvée) |
| 22:19 | FS | nasdaq.com historical data page terms of use automated access Nasdaq Official Closing Price download | nasdaq.com/market-activity/quotes/historical [abs] ; Nasdaq Equity 7 (tarifs d'échange [abs], non exploité) |
| 22:20 | FS | FINRA SEC free official closing price data NMS stocks download end of day consolidated | FINRA TRACE/short-sale volume ; aucun jeu de clôtures d'actions |

Note : un résultat de recherche (page Yahoo « CBOE ») affichait des cours du jour ; ce sont des valeurs d'écran, **non reprises** (règle « chiffres de marché vus à l'écran jamais réutilisés comme faits »).

## Addendum — lectures 22:24-22:27Z

| Heure UTC | Outil | URL | Résultat | Classe | Usage |
|---|---|---|---|---|---|
| 22:24 | FC dQ | https://databento.com/docs/schemas-and-data-formats/statistics | 200 [lu dQ] | P1 | A2 |
| 22:24 | FC dQ + parser PDF | https://datashop.cboe.com/documents/Equity_EOD_Summary_Layout.pdf | 200, 2 p. [lu dQ] | P1 | A4 |
| 22:24 | FC dQ | https://databento.com/blog/introduction-market-data-licensing | 200 [lu dQ] | P1 | A1 |
| 22:24 | FC dQ | https://massive.com/legal/businesses-terms-of-service | 200 [lu dQ] | P1 | A3 |
| 22:25 | FS | Cboe DataShop terms and conditions license historical data redistribution derived data internal use | pistes : datashop.cboe.com/data-policies, page sœur Open-Close (clauses [abs]), Cboe Europe Data Policy (hors périmètre US), All Access API [abs] | — | A4 |
| 22:26 | FC dQ + parser PDF | https://datashop.cboe.com/documents/DataShop_Policies_for_Historical_Data_Services.pdf | 200, 5 p. [lu dQ] | P1 | A4 |
| 22:26 | FC dQ + parser PDF | https://datashop.cboe.com/documents/Cboe_LiveVol_DataShop_License_Agreement.pdf | 200, 16 p. [lu dQ] | P1 | A4 |
| — | non ouvert | https://cdn.cboe.com/resources/membership/Marked_Market_Data_Policies_july2026.pdf (Cboe North American Data Policies) | budget | P1 | P-CBOE-1 |
