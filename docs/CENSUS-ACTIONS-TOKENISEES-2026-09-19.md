# Census actions tokenisées couvrables par Bell — 2026-09-19
Chercheur `claude-sonnet-5` (effort max), archive complète `F:\PRODUITS\etude-2026-09-19\sources-web-2026-09-19\census-tokenized-equities\` (00-INDEX, fiches 02-07 par émetteur, 09 RPC publics, 10 coût Helius, 11 contradictions/NON TROUVÉ, `tokens-census.csv` 31 lignes + CSV d'échantillons, `JOURNAL-URLS.md`). Persisté par l'orchestrateur. Définition de « couvrable » = **pool DEX on-chain avec fills récents (volume 24 h > 0) + quorum de 2 RPC publics + référence de clôture** (celle du code Bell), pas « listé au catalogue ».

## Chiffres (vérifiés par le chercheur, méthode reproductible : mint via `lite-api.jup.ag`, pool par adresse via DexScreener)
| Émetteur | Chaîne(s) | Catalogue déclaré | Vérifié couvrable | Note |
|---|---|---|---|---|
| Backed xStocks | Solana (+ BNB, Arbitrum, Ethereum non vérifiées) | 811 | **4 intégrés + 20 confirmés** (pool exact + volume 24 h 10⁵-10⁶ $) ; sur 100 xStocks Solana échantillonnés, **61 ont un volume 24 h > 0** | population plausible ≫ 25 ; pool `SPYx` de Bell n'est plus le plus fort volume (un autre pool Raydium) — à vérifier |
| Ondo Global Markets | Ethereum (+ BNB, Solana) | 452 (API publique `app.ondo.finance/api/v2/assets`, confirmée indépendamment) | **1 intégré (TSLAon) + 4 confirmés** (AAPL, NVDA, SPY, GOOGL) | marchés minces (10³ à ~23 k$/24 h) |
| Robinhood Chain | L2 Arbitrum Orbit, chainId 4663 | ~2 000 | **0 confirmé** (aucun token-action officiel identifié, recherches polluées par des spams) | **un seul RPC public** (`rpc.mainnet.chain.robinhood.com`) ⇒ quorum 2 impossible sans fournisseur payant |
| Dinari dShares | Arbitrum | 724 | 0 (SPY.d : pool réel, volume 0) | |
| Securitize | — | 1 | sous le seuil | |
| Swarm | Base | 9 dTokens | 0 (un pool à fort volume, identité émetteur non confirmée — exclu par prudence) | |
| Kraken / Bybit / Jupiter | vitrines | — | ne s'additionnent pas (même registre Backed) | |
**Total couvrable vérifié aujourd'hui : ≈ 25-30 tokens** ; catalogues cumulés ≈ 4 000. L'écart catalogue / marché secondaire actif est le résultat central.

## RPC publics par chaîne (fiche 09)
Quorum 2 gratuit sans clé atteignable aujourd'hui sur Solana, Ethereum, BNB, Arbitrum, Base ; **Robinhood Chain : 1 seul** ; publicnode Solana vivant mais profondeur ≈ 3 jours ; Tenderly et Nodies keyless testés en direct.

## Coût collecteur (fiche 10, dérivé du code)
≈ **8 + 1,2 × N_fills appels RPC par pool et par session** ; Helius ≈ N_fills + 4 crédits/pool/session (le public est gratuit) ; à 10 M crédits/mois et 3 244 fills/j/pool (seul chiffre mesuré) : **≈ 102 pools** avec Helius en premier fournisseur, **≈ 513** si l'ordre est inversé (public d'abord, Helius en second). **Contrainte séparée** : le collecteur est **séquentiel** (`min-interval` 250 ms) ⇒ ≈ 16 min par pool ⇒ le temps plafonne la couverture avant les crédits — item : parallélisme borné par fournisseur (lot -b).

## Note de canal
Le chercheur a signalé comme « injection potentielle » un message reçu en cours de mission citant l'endpoint Ondo : c'était le message de l'orchestrateur (canal SendMessage légitime). Sa réaction (re-vérifier, ne rien prendre pour argent comptant) est la bonne ; les chiffres ont été confirmés indépendamment.

## Conséquences (orchestrateur)
1. **Bell -b** démarre sur **Solana xStocks** (20 pools confirmés + les 4 intégrés), avec Helius en **second** fournisseur (public d'abord) et parallélisme borné — objectif ≈ 60 pools Solana à la première course, puis Ondo Ethereum (4) et BNB (xStocks/onTokens, à vérifier).
2. **Second RPC payant (décision 38)** : Triton pour Solana (archive complète) ; pour **Robinhood Chain**, un fournisseur payant est **indispensable** au quorum — à chiffrer si des tokens-actions officiels y sont confirmés (procurement formé : page contrats Robinhood rendue en JS).
3. Items formés : pool SPYx à re-pointer ; extension du census aux 61 xStocks à volume > 0 (pool exact) ; BNB/Arbitrum xStocks ; Robinhood contrats officiels ; Swarm identité.

---
## ERRATUM (orchestrateur, audit Firecrawl à la demande de l'investisseur « je pense que tu te trompes », 2026-09-19)
Le chiffre « ≈ 25-30 couvrables » est **faux comme réponse à la question posée** : il ne mesurait que ce que le chercheur avait vérifié pool par pool (Solana xStocks + Ethereum Ondo), et j'ai présenté cette borne inférieure d'échantillon comme le plafond. `error_origin` = **orchestrateur** (consommation d'un census à périmètre déclaré incomplet sans le requalifier). Sources d'audit [abs, Firecrawl, 2026-09-19] :
1. **BNB Chain absente du census** alors que, d'après Token Terminal cité par Binance News (31/08/2026) et repris par onebullex.com, les 7 tokens-actions les plus échangés sur 30 jours sont **tous sur BNB Chain ou Robinhood Chain** : QQQb 1,6 G$, SPCXb 849 M$, SPYb 645 M$, NVDAb… (tokens « b », écosystème bStocks) ; Uniswap + PancakeSwap = 5,2 G$ de volume actions tokenisées au T3 2026 (Crypto Briefing cité).
2. **Robinhood Chain sous-estimée** : mainnet public depuis le 01/07/2026 (chainId 4663), **> 190 stock tokens listés**, 34,6 G$ de volume DEX cumulé en deux mois (insights4.vc cité), NVDA/SPACEX/SPY dans le top 7 ; et **plusieurs fournisseurs RPC** — la doc officielle `docs.robinhood.com/chain/connecting/` recommande Alchemy et liste QuickNode, Blockdaemon, dRPC, Validation Cloud, en plus du public `rpc.mainnet.chain.robinhood.com` ; comparenodes.com liste 27 endpoints publics. Le « un seul RPC public » du census est **faux** (le chercheur n'a lu que l'endpoint natif).
3. **Base absente** : Coinbase Tokenize (SPCX, NVDA, GOOGL, MSTR, BMNR…) ≈ 7 % des swaps DEX de Base le 17/09/2026, ~60 M$/24 h (source secondaire, à vérifier).
4. **Contexte** : SEC — cadre « five-year onchain runway » pour les actions tokenisées (17/09/2026, CoinDesk/Benzinga) ; xStocks à **715 actifs** (solanacompass citant xstocks.com) ; valeur par émetteur au 01/09 : Ondo ≈ 840 M$, xStocks ≈ 607 M$ (Xangle). Les parts de marché par chaîne sont **contradictoires** entre sources (« Solana 95-99 % » vs « BNB + Robinhood en tête ») ⇒ mesure primaire requise (Token Terminal / DefiLlama / DexScreener par adresse).
**Ce qui reste vrai** : « couvrable » = pool avec fills + quorum 2 RPC + référence de clôture ; les catalogues ne sont pas des marchés. **Ce qui change** : le plafond réaliste n'est pas 25-30 mais **plusieurs centaines**, portées par BNB Chain (bStocks/xStocks b), Robinhood Chain (190+) et Base (Coinbase), toutes EVM ⇒ jambe `ethereum.ts` réutilisable. Seconde passe de census lancée (BNB, Robinhood, Base, sources primaires).
