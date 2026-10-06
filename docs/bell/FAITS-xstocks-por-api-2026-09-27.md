# FAITS — xStocks, API publique « Proof of Reserves » (lecture sur place, orchestrateur `claude-fable-5-1`, navigateur interne, 2026-09-27 07:27-07:3x UTC)

Contexte : PX-Bell-7 (registre PAROXYSME) — des extraits de recherche [2nd] disaient « PoR xStocks publié on-chain via Chainlink ». Le fait servi par Bell (`apps/bell/src/supply.ts` POR_SOURCES, [lu] 2026-09-19) : les quatre xStocks Solana sont attestés HORS chaîne (The Network Firm, por.backed.fi) ; flux Chainlink DataLink existants mais `proxyAddress` null ⇒ `onchainFeed: null`, résidu `por_unavailable`.

## Lu [lu, https://docs.xstocks.fi/apis/openapi/proof-of-reserves, 07:27Z]
- Section « Public » de la référence d'API xStocks (v2) : opérations `GET /public/proof-of-reserves` (« Get proof of reserves for all assets. », paginé `page` ≥ 0, `pageSize` 1..100, défaut 100) et `GET /public/proof-of-reserves/{symbol}` ; hôte `https://api.xstocks.fi/api/v2/…` (lu dans le HTML de la page).
- Autres sections publiques : Assets (`/public/assets/{symbol}`, `…/multiplier`, `…/multiplier/history`, `…/price-data`, `…/circulating-supply`, `…/total-supply`), Oracles, System, Corporate Actions, Bridges ; sections authentifiées : Client, Trades, xChange/Market/xPort Trades, Bridge Operations.
- Documents liés : `xstocks.fi/documents/xstocks-terms-of-service.pdf`, `…/xstocks-privacy-policy.pdf` (NON lus ici).

## Ce qui est établi / non établi
- **Établi** : l'API PoR de xStocks est un service REST HORS chaîne (données servies par l'émetteur) — ce n'est pas un agrégateur on-chain ; **le fait servi par Bell (« every onchainFeed is null ») n'est PAS contredit** par cette page. L'extrait [2nd] « publié on-chain via Chainlink » n'est pas confirmé par la page primaire.
- **Non établi** : contenu et champs de la réponse PoR (schéma non lu : page tronquée à la section Request), méthode d'attestation derrière l'API (The Network Firm ? autre ?), fraîcheur, conditions d'usage (ToS non lu).
- **Item BELL-POR-XSTOCKS-API-1** (propriétaire orchestrateur ; déclencheur : avant tout appel) : lire le ToS xStocks sur place, puis le schéma de `GET /public/proof-of-reserves/{symbol}` ; décider si Bell peut nommer cette API comme SECONDE source PoR (émetteur, hors chaîne) à côté de por.backed.fi — jamais comme `onchainFeed`. Règle « lecture sur place » respectée : aucun appel d'API fait.
