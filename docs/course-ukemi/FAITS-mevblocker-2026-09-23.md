# FAITS — MEV Blocker (rpc.mevblocker.io), lecture sur place — 2026-09-23

Orchestrateur `claude-fable-5-1`, navigateur interne, lu le **2026-09-23 01:27-01:32 UTC**. [lu] première main. Motif : recorder temps 1 essai 2
STOP `NoQuorumError eth_call` à 01:21:55Z, dernier défaut = `HttpError 429` (page HTML Cloudflare) de l'opérateur `mevblocker.io`.

- `https://docs.cow.fi/mevblocker/users/rpc` → page « MEV Blocker Update » : « MEV Blocker has been acquired », redirection vers
  `https://docs.mevblocker.io` (annonce sur smg.org, non lue). La doc CoW n'est plus la source primaire.
- `https://docs.mevblocker.io` (Introduction, « Last updated on Dec 18, 2025 ») : « Permissionless — All endpoints and features are fully
  permissionless », « Free ». Aucune mention de limite de débit (recherche « rate limit » dans la page : 0 résultat).
- `/reference/api/transaction-endpoints` : base `https://rpc.mevblocker.io`, endpoints `/fast`, `/noreverts`, `/fullprivacy`, `/maxbackruns`,
  `/nochecks` + boost ; cinq paramètres de requête documentés (partage searchers, bénéficiaire du rebate, referrer, soft cancellations). Aucune limite de débit.
- `/reference/api/json-rpc-methods` : « No authentication is required ». Méthodes DOCUMENTÉES : `eth_sendRawTransaction`,
  `eth_getTransactionCount`, `eth_getTransactionByHash`, `eth_cancelTransaction`, `eth_subscribe` (ws), `eth_sendBundle`, `eth_cancelBundle`,
  `mev_sendBundle`, `eth_callMany`. **`eth_call` et `eth_getLogs` ne figurent PAS dans la doc** — leur service (mesuré depuis U-1, census A §2)
  est un comportement de fait du nœud amont, non un engagement documenté ; **aucune limite de débit publiée** ⇒ la seule mesure est la nôtre.
- Page `/concepts/faq` : inexistante (404).
- **NON LU** (pages du site non ouvertes, à lire si une limite est cherchée ailleurs) : `/how-to`, `/how-to/searchers`, `/concepts/how-it-works`, `/concepts/gas-rebates`, `/concepts/order-flow-auction`, `/reference/performance`, `/reference/api/rest-api-methods` ; l'annonce d'acquisition sur smg.org.

## Mesure propre (essai 2, `record/U4-filter-23414968.json.diag.json`, 00:46:00Z → 01:21:55Z, `--min-interval-ms` 200 par défaut)
- mevblocker.io : 2 626 appels, **360 erreurs** dont **355 × HTTP 429 sur eth_call** (13,5 %, > règle des 5 % D-4), 2 « service temporarily
  unavailable » getLogs, 1 « more than 10000 results », 1 TypeError, 1 AbortError.
- drpc.org : 1 400 appels, 58 erreurs (50 × 400 « ranges over 10000 blocks … free plan » getLogs, 5 × 408 timeout eth_call, 2 TypeError, 1 × 500).
- tenderly.co 693 appels, 0 erreur ; chainstack 487 appels (banc), 0 erreur. Concordance : 5 paires, **0 discordance** (2 393 accords).
- Mécanique du STOP (`rpc2.ts quorum2`) : un défaut de transport bench l'URL 25 s ; pool eth_call = [drpc, mevblocker, chainstack] ;
  drpc benché (408/TypeError) + mevblocker 429 ⇒ un seul résultat ⇒ `NoQuorumError`. Le retry appelant (`--retries` 2, backoff 500/1000 ms,
  cap 8 000) n'honore pas `retryAfterMs` (fixe) et ne survit pas à une fenêtre 429 Cloudflare.
- Cache `--resume` : 1 706 lignes `ethCall` conservées (rejeu à 0 appel) ; `n_at_risk_seen` 346 ; `U4-filter-23414968.json` non écrit.
