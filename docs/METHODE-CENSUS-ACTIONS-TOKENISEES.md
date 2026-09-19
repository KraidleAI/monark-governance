# Méthode de census des actions tokenisées — règle investisseur (2026-09-19, tous projets)
Verbatim de la règle : **« Census d'abord. Puis l'émetteur. Puis le print. Le ticker n'est pas la source. »** et **« à partir de maintenant, et pour le bien de tout autre projet, la méthode qui t'a dit qu'il n'y avait pas de stocks, ne l'utilise plus. »**
**Méthode BANNIE** (v1, 2026-09-19) : partir d'un ticker, chercher un mint par API d'agrégateur (Jupiter `lite-api`), confirmer un pool par DexScreener, échantillonner, et conclure sur la population. Elle a produit « 25-30 couvrables » là où le marché en compte des centaines (erratum `CENSUS-ACTIONS-TOKENISEES-2026-09-19.md`). Interdits explicites : un DexScreener seul ; un ticker `TSLAx` sans chaîne ; coller PONS (launchpad Robinhood Chain) et Opening Bell (actions SEC-registered) dans le même seau ; dire que le feed 24/7 = Nasdaq open.

## 1. Census (une table pour tout)
| Source | Quoi | Lien |
|---|---|---|
| **RWA.xyz Tokenized Stocks** | AUM, holders, volume, **contrat**, réseau, plateforme — ~1,87 G$ distribués (Ondo ~47 %, xStocks ~25 %, puis Securitize / Figure / Robinhood / Backed / Dinari) [investisseur, à relire à la source] | `app.rwa.xyz/stocks` |
| RWA.xyz × plateforme | xStocks, Ondo, Backed, Opening Bell, Reality, Robinhood | `app.rwa.xyz/platforms/<x>` |
| API RWA.xyz | même objet, pour un agent | « Data & API » dans l'app |
| DefiLlama (RWA / equities) | TVL **DeFi** (collatéral, LP) ≠ AUM token | defillama.com |
RWA.xyz = **stock**. DefiLlama = **ce qui est locké dans un protocole**. Ne pas les additionner. Chaînes en mouvement : Solana, Ethereum, Base, Arbitrum, Ink, HyperEVM, Mantle, TON, Robinhood Chain, XRPL.

## 2. Émetteurs (mint, redeem, wording, ISIN)
| Émetteur | Docs / data | Chaînes typiques |
|---|---|---|
| xStocks / Backed | `docs.xstocks.fi/docs/how-xstocks-work` · `defi.xstocks.fi` (PoR) · Dune officiel `dune.com/xstocks/xstocks` | SOL, ETH, Arb, Mantle, TON, Ink, + |
| Ondo Global Markets | ondo.finance docs + page asset RWA (`MSTRon`…) | ETH, SOL, HyperEVM, XRPL… |
| Superstate Opening Bell | superstate.co · `app.rwa.xyz/platforms/superstate-opening-bell` | SOL (actions **SEC-registered**), un peu ETH |
| Robinhood tokenized | robinhood.com / explorer chaîne · RWA « Robinhood » ~94 assets | Robinhood Chain (Orbit) + produit EU |
| Coinbase B20 | `docs.chain.link/data-feeds/tokenized-equity-feeds/coinbase` | Base |
| Dinari | docs.dinari.com | EVM, dShares |
| Securitize / Figure / WisdomTree | pages RWA (peu d'actifs, gros AUM) | ETH surtout |
| Reality (rGOOGL…) | `app.rwa.xyz/platforms/reality` | Arbitrum |
**PONS n'est pas l'action** : launchpad sur Robinhood Chain.

## 3. Prix / séance (ce qu'on atteste)
| Source | Objet | Lien |
|---|---|---|
| **Chainlink Tokenized Equity Feeds** | **24/5**, sessions US, prix **du token** (méthodo émetteur, TR, dividendes) ≠ last print Nasdaq | `docs.chain.link/data-feeds/tokenized-equity-feeds` |
| Chainlink × B20 | `price × multiplier` on-chain Coinbase | `…/tokenized-equity-feeds/coinbase` |
| **Pyth** `Equity.US.*` | equity cash, pull, Hermes **clé API depuis août 2026** | `docs.pyth.network/price-feeds/pro/price-feed-ids` |
| LlamaRisk | « price is not enough » : session, overnight, week-end | thread + méthodo Aave |
Pour Bell / Koyomi / Shōgen : **deux objets** — le print (Pyth/Chainlink) et le fichier séance (horaire NY, primary halt). Chainlink le dit : le feed tokenisé **n'est pas** l'action.

## 4. On-chain brut (mints, burns, DEX)
Solana : Solscan mint · Dune xstocks · Jupiter / Birdeye pair. Ethereum / L2 : Etherscan token · Dune `token_erc20`. Base B20 : Basescan + docs Chainlink. Robinhood Chain : Blockscout chain 4663 · Bitquery (PONS). Multi : Bitquery, Allium, Goldsky. Volume DEX : Jupiter (SOL), DexScreener (**par pair, jamais seul**), Dune xStocks « DEX volume by asset ». Mint/redeem **24/5** chez xStocks ; le DEX **24/7** — c'est le gap de séance.

## 5. Corporate actions / NAV
xStocks : **rebase on-chain** (splits, dividendes — docs « How xStocks Work ») ; Ondo : NAV + exposition économique, dividendes réinvestis ; Superstate : allowlist, droits de l'action réelle ; SEC : halts, NMS — le venue on-chain doit **halter avec le primary** (exemption 2026). **Sans ça, un `commit` le week-end sur un wrapping qui n'a pas rebasé est un faux print.**

## 6. Ordre pour un agent (90 min)
1. `app.rwa.xyz/stocks` → liste + corporate actions ; 2. docs émetteur du wrapping ; 3. feed : Chainlink tokenized **si** le collatéral est le token, Pyth equity **si** on prie le cash ; 4. Dune `xstocks/xstocks` pour SOL/ETH AUM ; 5. un mint + un burn sur l'explorer (preuve du file).

## Conséquences pour Bell (orchestrateur, à porter dans ADR-T1aii lot -b)
- **g_t = ln(P_token / P_close)** doit lire les **rebases/multiplicateurs** de l'émetteur avant toute comparaison (xStocks rebase on-chain ; Coinbase B20 `price × multiplier` ; Ondo NAV) — sinon faux print le week-end. Le fait (iv) « multiplicateur constant » (C-4) devient un fait **par session**, pas une hypothèse.
- **Référence de clôture** : Pyth `Equity.US.*` (cash, dernier print de séance) ou Chainlink tokenized (prix du token 24/5) sont deux objets ; Bell atteste l'écart du token au **cash close**, et consigne le feed tokenisé comme second témoin, jamais comme la clôture.
- **Halts** : le venue on-chain doit halter avec le primary ; `no_fill_in_window` pendant un halt primaire est attendu, pas une anomalie ; le fichier séance (horaire NY, halts) devient une entrée du collecteur.
- Census v2 redirigé sur cette méthode (RWA.xyz d'abord).
