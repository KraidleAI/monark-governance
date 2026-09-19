# SOURCES — journal des URL (mission 2026-09-18)

Format par entrée : `[date/heure fetch] URL — méthode — HTTP/statut — résultat bref`.

## Fetches réussis (Partie A)

- 2026-09-18 — `https://monarkgate.tech/narabi/state.json` — curl direct — HTTP 200, 400 bytes — [lu] contenu complet capturé.
- 2026-09-18 — `https://monarkgate.tech/narabi/timeline.jsonl` — curl direct — HTTP 200, 1309 bytes (1 ligne) — [lu] contenu complet capturé.
- 2026-09-18 — `https://governance.aave.com/t/risk-stewards-irm-changes-on-aave-v3-2026-09-11/25627.json` — curl (Discourse JSON API) — HTTP 200, 33725 bytes — [lu] intégral (1 post, LlamaRisk, 2026-09-11T19:24:31Z). Sauvegarde locale scratchpad `aave_gov.json` / `aave_gov_cooked.html`.
- 2026-09-18 — `https://aave.com/blog/ethena` — WebFetch — [lu] extrait — confirme le nom "Aavethena", daté 2025-08-29.
- 2026-09-18 — `https://governance.aave.com/search.json?q=Ethena%20Spoke` — curl (Discourse search API) — HTTP 200, 29772 bytes — [lu] 27 topics listés, aucun match direct pour un "Ethena Spoke" daté 2026-09-07.
- 2026-09-18 — `https://www.cryptotimes.io/2026/09/07/aave-v4-activates-usde-rewards-in-new-ethena-market/` — WebFetch — [lu] — P2, daté 2026-09-07, cite "Ethena" comme source de la citation.
- 2026-09-18 — `https://blockworks.com/insights/ethena-aave-v4-allocation` — WebFetch — [lu] — P2, daté 2026-06-19 (pas septembre).
- 2026-09-18 — `https://raw.githubusercontent.com/aave/gho-core/main/src/contracts/gho/GhoToken.sol` — curl direct — HTTP 200, 4281 bytes — [lu] intégral.
- 2026-09-18 — `https://raw.githubusercontent.com/aave/gho-core/main/src/contracts/gho/ERC20.sol` — curl direct — HTTP 200, 5545 bytes — [lu] intégral.
- 2026-09-18 — `https://raw.githubusercontent.com/aave/gho-core/main/src/contracts/gho/interfaces/IGhoToken.sol` — curl direct — HTTP 200, 4883 bytes — [lu] extrait (doc burn()).
- 2026-09-18 — `https://etherscan.io/address/0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f#code` — WebFetch — [lu] — confirme "Source Code Verified — Exact Match", contrat `GhoToken`, compilateur v0.8.10+commit.fc410830.
- 2026-09-18 — `https://www.ark-invest.com/articles/analyst-research/multi-collateral-backed-stablecoins-dai-usds` — WebFetch a échoué (HTTP 403) ; **réussi via curl + user-agent navigateur** — HTTP 200, 138680 bytes — [lu] intégral (grep + extraction node). Publié 25 juin 2026, données "as of June 11, 2026".
- 2026-09-18 — `https://developers.sky.money/guides/psm/litepsm/` — WebFetch — 301 redirect suivi vers `https://developers.skyeco.com/guides/psm/litepsm/` — [lu] — mécanisme confirmé, aucun pourcentage.
- 2026-09-18 — `https://developers.circle.com/circle-mint/concepts/how-minting-works` — WebFetch — [lu] — "Payouts typically settle on the next business day."
- 2026-09-18 — `https://www.circle.com/legal/usdc-terms` — curl + user-agent navigateur — HTTP 200, 376800 bytes (texte extrait 79814 caractères) — [lu] intégral, aucune mention explicite "T+1"/"T+2".

## Fetches échoués (Partie A)

- 2026-09-18 — `https://help.circle.com/s/article/USDC-redemption-structure` — WebFetch ET curl (user-agent navigateur) — page de chargement Salesforce vide (JS requis), aucun contenu utile extrait — **NON TROUVÉ**.
- 2026-09-18 — `https://www.sec.gov/Archives/edgar/data/1876042/000119312525135795/d737521d424b4.htm` — curl — HTTP 403 (anti-bot probable) — **NON TROUVÉ**.
- 2026-09-18 — `https://sourcify.dev/server/check-all-by-addresses?addresses=...&chainIds=1` — curl — HTTP 404 (mauvais endpoint / API changée) — abandonné, remplacé par vérification Etherscan directe (réussie).
- 2026-09-18 — `https://www.ethena.fi/blog` — WebFetch — page chargée mais sans contenu d'articles listé (nécessite JS/pagination) — **NON TROUVÉ** pour un post daté 2026-09-07.
- 2026-09-18 — `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=...` — curl — HTTP 200 mais `{"status":"0","message":"NOTOK", ...endpoint V1 déprécié...}` — remplacé par WebFetch de la page Etherscan directement (réussi).

## Fichiers locaux consultés (P1, dépôt Monark)

- `F:/Monark/docs/adr/ADR-M008-narabi-attested-flow.md` — [lu] (lecture complète, voir aussi INVENTAIRE-stables.md pour citations).
- `F:/Monark/docs/CLOTURE-lot-f2b-usde.md` — [lu] intégral — contient la leçon F2-A msUSD (q̂=0, calibration dégénérée refusée).
- memstack `memory_query` — requête "Narabi AttestedFlow USDe msUSD stablecoin calibration q_hat degenerate GHO stable-run-velocity" — 8 souvenirs, k=10 — [lu] aperçus (280c), uid notés si approfondi (voir liste ci-dessous).

### uid memstack pertinents (aperçus 280c, [2nd] tant que non ouverts en entier via memory_get)

- `uid=423d6e514dc04789b5239b7396640fbc` — 2026-09-12 — msUSD = 1er lot de calibration, pas le périmètre.
- `uid=e83e9318c53d4a75a045836eb748f4ba` — 2026-09-16 — v0.2.0 = F1-only Narabi.
- `uid=8a730103f8d249698cf4f670fd6805e0` — 2026-09-16 — F2 msUSD : calibration dégénérée, under_calib probable (192 calm + 6 run).
- `uid=10a078ea5cfe4c3888ff3eaec78a5403` — 2026-09-13 — msUSD P-F-5 : Main Street msUSD v2 = cible du run (PAS Metronome), adresse token 0x4ba01f22827018b4772CD326C7627FB4956A7C00, minter 0x70C0c12fBb3acFFf8E48aBf027436971cF2Ade14.
- `uid=610b5a52b5394ebeb95039da79a187ac` — 2026-09-17 — F2-B : USDe choisi, token 0x4c9EDD5852cd905f086C759E8383e09bff1E68B3 mainnet.

## Fetches réussis (Partie B — inventaire stables)

- 2026-09-18 — `https://docs.ethena.fi/llms-full.txt` — curl direct — HTTP 200, 399683 bytes, 4009 lignes — [lu] intégral (grep ciblé : Silo, cooldown, LayerZero, USDtb). Source la plus riche de la passe B, sauvegardée scratchpad `ethena_full.txt`.
- 2026-09-18 — `https://docs.ethena.fi/backing-custody-and-security/backing-asset-custody` — WebFetch — [lu] extrait — mint/redeem USDe (Off-Exchange Settlement), pas de détail sUSDe.
- 2026-09-18 — `https://docs.usdx.money/a-synthetic-usd/usdx-basics` — WebFetch — [lu] extrait — mécanisme mint + whitelist KYC/KYB pour redeem.
- 2026-09-18 — `https://www.cryptopolitan.com/stables-labs-starts-usdx-recovery-process/` — WebFetch — [lu] — dates/chiffres du depeg USDX (3-6 nov. 2025).
- 2026-09-18 — `https://www.coingecko.com/en/coins/stables-labs-usdx` — WebFetch — [lu] — adresse contrat + supply/market cap (P3, non recoupé Etherscan).
- 2026-09-18 — `https://resolv.xyz/blog/resolv-postmortem-march-22-2026-incident` — WebFetch — [lu] intégral — postmortem officiel P1, chiffres exacts exploit USR.
- 2026-09-18 — `https://docs.usdtb.money/` — WebFetch — [lu] extrait — confirme émetteur Anchorage Digital Bank (13 oct. 2025), backing BUIDL ; pas de détail mécanisme/adresse.
- 2026-09-18 — `https://docs.usual.money/usual-products/usd0-stablecoin/usd0/flow-and-architecture` — WebFetch — [lu] — deux voies de mint, deux voies de rachat, verbatim.
- 2026-09-18 — `https://docs.curve.finance/developer/crvusd/overview` — WebFetch — [lu] extrait partiel — confirme Controller (mint contre collatéral) + LLAMMA (liquidation) ; PegKeeper confirmé par ailleurs (P2).

## Fetches échoués / partiels (Partie B)

- 2026-09-18 — `https://docs.ethena.fi/technical-design/staking-usde/staking-key-functions` — WebFetch — page atteinte mais sans le détail burn/Silo (trouvé ensuite dans `llms-full.txt`) — partiel.
- 2026-09-18 — `https://ethena-labs.gitbook.io/ethena-labs/solution-design/staking-usde` — WebFetch — 307 redirect vers `docs.ethena.fi/solution-design/staking-usde` — voir ligne suivante.
- 2026-09-18 — `https://docs.ethena.fi/solution-design/staking-usde` — WebFetch — **404** — NON TROUVÉ (contenu retrouvé via `llms-full.txt` à la place).
- 2026-09-18 — `https://docs.ethena.fi/solution-design/key-addresses` — WebFetch — **404** — NON TROUVÉ (OFT adapter USDe non confirmé en P1).
- 2026-09-18 — `https://www.ethena.fi/blog` (revisité) — voir Partie A, même échec.
- 2026-09-18 — `https://resources.curve.finance/crvusd/faq/` — WebFetch — **HTTP 404** — NON TROUVÉ.
- 2026-09-18 — `https://docs.curve.finance/crvUSD/crvUSD/` — WebFetch (implicite via résultats) — **404** — NON TROUVÉ.
- 2026-09-18 — `https://defillama.com/stablecoins` — WebFetch — **HTTP 403 Forbidden** — NON TROUVÉ (supply agrégée pour crvUSD/frxUSD/USD0/LUSD/USDS/GHO non obtenue via cette voie).
- 2026-09-18 — adresse token USR (Resolv) — recherchée, **NON TROUVÉE** (seules des adresses d'oracles trouvées) — dépôt `resolv-contracts-public` GitHub cité mais non ouvert.
- 2026-09-18 — adresse mainnet BOLD (Liquity V2) — recherchée, **NON TROUVÉE** (seule une adresse Sepolia testnet trouvée, signalée comme non utilisable).
- 2026-09-18 — adresse token USDtb — recherchée, **NON TROUVÉE** dans cette passe.

## WebSearch (Partie B, synthèses [2nd] sauf citations verbatim directement attribuées)

Requêtes menées (non ré-énumérées une à une) : sUSDe cooldown/ERC4626 ; USDX Stables Labs mécanisme/adresse/
supply ; USDX statut septembre 2026 ; USR Resolv mécanisme/adresse/supply ; USR exploit mars 2026 postmortem ;
deUSD Elixir mécanisme/statut 2026 ; USDe LayerZero OFT Adapter Ethereum ; USDtb BlackRock BUIDL mécanisme ;
USD0 Usual mécanisme/adresse ; USD0++ depeg janvier 2025 ; frxUSD Frax Finance mécanisme/adresse ; crvUSD
Curve PegKeeper mécanisme/adresse ; LUSD Liquity V1 adresse/supply ; BOLD Liquity V2 mécanisme/adresse ; GHO
supply septembre 2026 ; USDS Sky adresse/supply ; stablecoin supply agrégée septembre 2026 (échec, résultats
datés avril-août 2026 seulement).

Toutes les citations verbatim tirées de résultats WebSearch sont marquées **[2nd]** dans `INVENTAIRE-stables.md`
sauf quand un WebFetch direct sur la page source a confirmé le même texte (alors marqué [lu]).
