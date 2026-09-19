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
