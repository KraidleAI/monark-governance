# Census v3 actions tokenisées — mesure complète par adresse (2026-09-19)
Chercheur `claude-sonnet-5` (effort max), archive `F:\PRODUITS\etude-2026-09-19\sources-web-2026-09-19\census-tokenized-equities-v3\` (`00-INDEX`, `01-methode-et-calibration`, `addresses-v3.csv` / `pools-v3.csv` / `census-v3.csv` = 2 902 couples actif×chaîne, `JOURNAL-URLS`, `06-contradictions-et-non-trouve`). Persisté par l'orchestrateur après recompte indépendant du CSV et sonde live d'un pool (CRCLB PancakeSwap, volume 24 h ≈ 67 k$).

## Résultat (recompté par l'orchestrateur sur `census-v3.csv`)
| Mesure | Lignes (actif×chaîne) | Actifs distincts |
|---|---|---|
| Pool DEX trouvé | 379 | 338 |
| **Couvrable strict** (pool + volume 24 h > 0) | **370** | **330** (351 selon le décompte du chercheur, écart de clé de comptage — le nombre de lignes fait foi) |
Par chaîne (strict) : Robinhood Chain 138, Solana 90, BSC 87, Base 26, Ethereum 23, Arbitrum 4, Ink 2. **Zéro** sur TON, Optimism, X Layer, Mantle, HyperEVM, Tron malgré 150-170 déploiements xStocks chacune (omnichain sans liquidité).
Par émetteur (strict) : Robinhood 138, Ondo 57, xStocks 52, bStocks 52, Backpack 33, st0x 16, Coinbase 10, PreStocks 6, Reality 4, Tessera 2.
Par DEX : Uniswap 170, PancakeSwap 78, Raydium 58, Meteora 16, Orca 14, Aerodrome 14, Hydrex 12, InkySwap 2.
**Recoupement v2** : les 200 couvrables v2 (bStocks 52, Coinbase 10, Robinhood 138) retrouvés à 0 écart par une méthode indépendante ; les échantillons v1 (Solana 20, Ethereum 4) sont remplacés par la mesure complète (xStocks Solana 46, Ondo 57).

## Déviation méthodologique déclarée
Les fiches Token Terminal ne portent une adresse de contrat que pour bStocks (1 émetteur sur 7 testés ; l'exemple HOODb de la mission était l'exception). Le chercheur a pivoté vers les API officielles des émetteurs (sans clé) et, pour Backpack/Tessera/PreStocks, une recherche DexScreener par chaîne + symbole exact + adresse vanity (confiance moyenne, notée ligne par ligne).

## Finding central
Le filtre « transferts 24 h > 0 » de Token Terminal (1 847 lignes) **ne mesure pas la couvrabilité DEX** : sur Reality, le volume de transferts dépasse le volume du pool réel de 30× à 1 200× sur 4 tickers vérifiés. Les 330-351 sont une mesure directe, non extrapolable aux lignes non traitées.

## Non traité / NON TROUVÉ (procurements)
Dinari (97, API à clé) ; Backpack API officielle (clé) ; Robinhood « Classic Stock Token » (502 lignes, convention on-chain introuvable) ; Reserve (16, indices crypto, hors périmètre) ; Anchored 16, Shift 5, Remora 2 (négatif), 5 singletons. **Arbitrage investisseur** : inclure ou non les parts pré-IPO (PreStocks/Tessera : Anthropic, SpaceX, OpenAI — pas de clôture boursière possible, donc pas de g_t) ; proposition orchestrateur : **exclues de Bell** (aucune référence cash), consignées à part.

## Conséquences Bell -b
Population de première course = **370 lignes / 330 actifs**, ordre : Robinhood Chain (Uniswap, 138), Solana (Raydium/Meteora/Orca, 90), BSC (PancakeSwap, 87), Base (Aerodrome, 26), Ethereum (23). Décodeurs DEX requis : Uniswap V3, PancakeSwap V3, Raydium, Meteora, Orca, Aerodrome, Hydrex. Le chiffre remplace les 224 de v2 et les « 25-30 » de v1.
