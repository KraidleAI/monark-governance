# Census v2 actions tokenisées — BNB Chain, Robinhood Chain, Base (2026-09-19)
Chercheur `claude-sonnet-5` (effort max), méthode investisseur (RWA.xyz d'abord → émetteur → adresse exacte → pool par adresse, jamais un ticker seul) ; archive `F:\PRODUITS\etude-2026-09-19\sources-web-2026-09-19\census-tokenized-equities-v2\` (fiches 00-06, `JOURNAL-URLS.md`, `tokens-census-v2.csv` 283 lignes). Persisté par l'orchestrateur après recompte indépendant du CSV (52/138/10 exacts), sonde live de deux RPC Robinhood (`eth_chainId` = 0x1237 = 4663 sur le natif et dRPC) et d'un pool bStocks (SPCXB PancakeSwap, volume 24 h ≈ 2,36 M$ le 2026-09-19). Définition de « couvrable » inchangée : pool DEX avec volume 24 h > 0 + quorum 2 RPC + référence de clôture.

## Réponse à « combien d'actions ? il nous en faut le max »
| Chaîne | Émetteur | Catalogue (RWA.xyz / CoinGecko) | **Couvrables vérifiés par adresse** | DEX | RPC keyless |
|---|---|---|---|---|---|
| BNB Chain | **bStocks** = BTech Holdings Limited (SPV affilié Binance, ADGM/FSRA) [lu P1 : binance.com, bnbchain.org 11/06/2026] | 77 (RWA.xyz, 795,67 M$) ; CoinGecko 72 | **52** | PancakeSwap V3 (top SPYB ≈ 65 M$/24 h) | quorum 2 ok |
| Robinhood Chain (4663) | Robinhood | **194 natifs** (RWA.xyz ; les ~2 000 de v1 = 1 851 actifs Arbitrum « represented », non transférables) ; CoinGecko 193 | **138** | Uniswap + Ramses | **6 endpoints keyless vivants** (natif, dRPC, Nodeflare, publicnode, Tenderly, bloXroute) ; archive `eth_getLogs` jusqu'au bloc 1 sur 2 fournisseurs |
| Base (8453) | Coinbase Tokenize (`0xb2000…`) — non suivi par RWA.xyz | 10 | **10** | Aerodrome | quorum 2 ok |
| Solana (v1) | xStocks / Backed | 715-811 | 20 confirmés (+ 4 intégrés) ; 61/100 échantillon à volume > 0 | Raydium/Orca | Helius + public |
| Ethereum (v1) | Ondo GM | 452 | 4 (+ TSLAon) | Uniswap | keyless ×5 |
**Total vérifié aujourd'hui : 200 (v2) + 24 (v1) = 224 tokens couvrables, borne inférieure** (le v1 « 25-30 » était faux d'un facteur 7-9 ; xStocks Solana non recensé exhaustivement : ~60 de plus plausibles). Plafond réaliste : **≈ 300** avec l'extension xStocks Solana.

## Parts de marché (volume 24 h, RWA.xyz + CoinGecko categories, 2026-09-19) — contradiction v1 résolue par périmètre
bStocks BNB **304,3 M$** > Robinhood Chain 173,6 M$ > Ondo 139,0 M$ > xStocks 97,2 M$. « Solana 95-99 % » n'est vrai que **pour xStocks** (Solana 67,5 % + Ethereum 27,5 % de la valeur xStocks). xStocks sur BNB : 169 818 $ (négligeable) — ne pas confondre avec bStocks. Somme des écosystèmes > total agrégé CoinGecko (chevauchement de catégories, non tranché).

## NON TROUVÉ / procurements formés
- Proof of Collateral bStocks (page JS/anti-bot, HTTP 202 vide) — procurement : lecture au navigateur intégré par l'orchestrateur ou clé Firecrawl scrape.
- Page produit Coinbase Tokenize officielle — idem.
- Tables nominales RWA.xyz complètes gatées par login — procurement : compte / API RWA.xyz (décision investisseur pendante).
- Écarts : genèse Robinhood Chain bloc 1 = 30/04/2026 vs presse 01/07/2026 (mainnet public) ; comparenodes « 27-29 endpoints » vs 9 hostnames distincts ; volume Base ≈ 25,4 M$ mesuré sur 10 pools vs ~60 M$ de l'erratum (source secondaire — le mesuré prime).

## Note de canal
Le chercheur a de nouveau traité mon SendMessage (redirection sur la méthode investisseur) comme injection potentielle, a vérifié le fichier `METHODE-CENSUS-ACTIONS-TOKENISEES.md` à la source avant d'en tenir compte, et n'a cité aucun chiffre sans re-vérification. Réaction correcte ; canal légitime.

## Conséquences pour Bell -b (orchestrateur)
1. **Ordre de la première course** par volume : bStocks BNB (52) → Robinhood Chain (138) → Base Coinbase (10) → xStocks Solana (≈ 60) → Ondo ETH (4). Les trois premières sont EVM ⇒ jambe `ethereum.ts` + `chainId` paramétré, DEX à ajouter : PancakeSwap V3, Ramses, Aerodrome (décodeurs de `Swap` distincts d'Uniswap V3 — item formé).
2. **RPC** : Robinhood Chain quorum 2 keyless possible (6 vivants) ; fournisseur payant (décision 38) reste utile pour l'archive garantie et le débit ; Alchemy Free (recommandé par Robinhood) en second.
3. **Rebase/multiplicateur** : Coinbase B20 `price × multiplier` (Chainlink), bStocks et Robinhood : méthode de corporate actions à lire à l'émetteur avant tout `commit` (règle METHODE §5).
4. Census v1 : lignes BNB/Robinhood/Base **remplacées** par ce document ; l'erratum v1 reste comme trace.
