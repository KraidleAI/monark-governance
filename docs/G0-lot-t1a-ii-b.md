# G0 — Sprint backlog lot T-1a-ii-b : course fondatrice Bell (amendement de l'ADR-T1aii ligne -b après census v3 et décisions 38, 40, 41)
Orchestrateur `claude-fable-5-1`, 2026-09-19. Base : `lot/etude-suite` `6cef6a7`. Cadre : ADR-T1aii (D1-D4, ligne « T-1a-ii-b — course fondatrice », C-11..C-14), ADR-B0 (D9 lettre SEC Q3/Q6), `docs/METHODE-CENSUS-ACTIONS-TOKENISEES.md` §5-6 et « Conséquences pour Bell », `docs/CENSUS-ACTIONS-TOKENISEES-v3-2026-09-19.md` (362 lignes / 322 tickers couvrables, pré-IPO exclus, décision 40), `docs/RESSOURCES-RPC-CANDIDATS-2026-09-19.md` (Chainstack 5 nœuds archive benchés, Helius, keyless), décision 41 (clôture cash = Massive Starter, interne). Items ouverts absorbés : O-4 ancre série, O-6 divergence corps/sampling, O-8 tueur `vol_ratio` sous multiplicateur, O-9 `isSolRevert`, O-10 override env, O-11 intégration hors ligne jambe Ethereum, O-12 `Infinity`.

## Ce qui a changé depuis l'ADR (faits, pas opinions)
1. La population n'est plus « 4 pools xStocks Solana » mais **322 tickers sur 5 chaînes** (Robinhood Chain 138, Solana 90, BSC 87, Base 26, Ethereum 23), dominée en volume par BSC et Robinhood Chain.
2. La fenêtre « 2025-07-01 → 2025-10-31 » n'existe **pas** pour bStocks (lancés 06/2026) ni Robinhood Chain (mainnet public 07/2026) : une fenêtre unique est impossible ; la fenêtre devient **par chaîne**.
3. Le quorum est provisionné : Helius + Chainstack (Solana, archive complète) ; Chainstack + keyless (EVM).
4. La clôture cash est Massive Starter (SIP consolidé), usage interne ; publication dérivée = bascule ultérieure (Databento/Tiingo).
5. Les DEX à décoder ne sont plus Raydium seul : Uniswap V3 (Robinhood, Ethereum, Ink), PancakeSwap V3 (BSC), Aerodrome (Base), Raydium/Meteora/Orca (Solana).
6. Rebases et multiplicateurs (xStocks rebase on-chain, Coinbase `price × multiplier`, Ondo NAV) doivent être lus **avant** toute comparaison (METHODE §5) ; le fichier séance (horaires NY, halts par titre, niveaux MWCB du jour) est une entrée.

## Découpe R-25 (chaque sous-lot < 1 205, cible ≤ 700 ; séries `apps/bell/test/fixtures/series/**` exclues D9 sexies ; docs exclus D9 septies)
| Sous-lot | Contenu | Oracle |
|---|---|---|
| **-b1 Solana fondatrice** (`lot/t-1a-ii-b1`) | ADR ligne -b telle quelle, élargie : spike Helius + Chainstack (profondeur mesurée sur les 4 pools intégrés + 20 confirmés v1), **course** sur les pools Solana couvrables (90 lignes v3, à trier par volume ; les 24 premiers au minimum) sur la fenêtre épinglée **2025-07-01 → 2025-10-31** pour les pools qui existaient, sinon **depuis le premier fill** (borne déclarée par pool, C-11) ; quorum Helius + Chainstack (second fournisseur, `providerOf` distinct) ; parallélisme borné par fournisseur (item census v1) ; statistique Table 4 de Cong par régime ; série réduite committée + PROVENANCE ; rapport `docs/MESURE-FONDATRICE-bell-2026-09.md` (Solana) ; O-4, O-6, O-9, O-10, O-12 pliés ; `no_secret_in_repo` étendu aux URL Chainstack (`core.chainstack.com/<hex>`) | `bell_course_reduced_series_replays`, `series_pinned_are_declared_and_hashed`, spike sha-pinné, mutant octet ⇒ rouge ; crédits Helius mesurés au spike, arrêt si > 1 M (D3) |
| **-b2 Jambe EVM multi-DEX** (`lot/t-1a-ii-b2`) | décodeurs `Swap` : Uniswap V3 (existant `ethereum.ts`, généralisé par `chainId`), PancakeSwap V3 (même ABI, adresses BSC), Aerodrome (Solidly, ABI distinct), via `eth_getLogs` par pool ; registre `pools.ts` étendu par chaîne depuis `census-v3.csv` (adresses vérifiées, DEX, `chainId`) ; quorum Chainstack + keyless (Robinhood ×6, BSC, Base, Ethereum) ; O-11 intégration hors ligne (stub `eth_getLogs`) ; O-8 tueur `vol_ratio` sous multiplicateur ≠ 1 ; course EVM sur fenêtre **par chaîne = depuis le premier fill de chaque pool jusqu'au 2026-09-15**, top 20 pools par chaîne par volume (Robinhood, BSC, Base, Ethereum = 80 pools) ; série réduite + rapport EVM | test d'intégration hors ligne par DEX (fixture de logs sha-pinnée, VWAP recomputé bit à bit), mutants par décodeur ; `getLogs` > 10 k blocs : forme d'erreur Chainstack mesurée et benchée sans splitter (règle §F) |
| **-b3 Corporate actions + séance** (`lot/t-1a-ii-b3`) | lecture des **rebases/multiplicateurs** par émetteur avant comparaison (xStocks `scaledUiAmountConfig` Token-2022 déjà lu ; Coinbase B20 `multiplier` on-chain via docs Chainlink ; Ondo NAV via `app.ondo.finance/api/v2` + attestation Ankura agrégée = résidu `por_daily_report_aggregate` parser) ; **fichier séance** `apps/bell/test/fixtures/series/sessions-<mois>.csv` : horaires NY, jours fériés, halts par titre (Nasdaq Trader), niveaux MWCB du jour (NYSE), 5 dates MWCB historiques ; `no_fill_in_window` pendant un halt = attendu ; clôture cash Massive Starter (`POLYGON_API_KEY`, prev close ajusté, jamais republié, ESC-1 c) avec **`close_source: "massive-starter-internal"`** dans la provenance et interdiction de publication dérivée tant que la licence d'affichage n'est pas acquise (décision 41) | tests : rebase ⇒ g_t inchangé sur session à multiplicateur ≠ 1 (mutant : multiplicateur ignoré ⇒ rouge) ; halt ⇒ résidu nommé ; fichier séance sha-pinné ; parser Ondo sur PDF fixture (sha `f46e35db…`) |

## Critères d'acceptation communs
1. Zéro secret dans l'arbre et les artefacts (`no_secret_in_repo` : UUID Helius, hex Chainstack, clé Massive) ; journaux = `providerOf` seul.
2. Chaque course : quorum 2 opérateurs distincts par fill ; `no_quorum` ⇒ pas de print ; crédits/RU mesurés et consignés (Helius, Chainstack 20 M RU/mois — arrêt et rapport si > 50 % du quota).
3. Mesure fondatrice = **constat**, jamais vert/rouge (ADR-T1aii C-3) ; écart à Cong publié colonne par colonne avec n par régime ; aucun chiffre sans unité.
4. Bell reste `upcoming` (CA-11) ; aucun site, aucun registre ; publication = T-1b.
5. Chaque sous-lot : G1 worker → G2 fraîche → checkpoint-2 → G7 ; R-25 < 1 205 mesuré sous la pathspec UNION ; séries exclues déclarées + hachées same-dir.
6. Oracles non-LLM par sous-lot listés ci-dessus ; mutants ≥ 6 par sous-lot.

## Décisions demandées au checkpoint-1 / investisseur
- **Q-A (valeur, investisseur)** : fenêtre par chaîne « depuis le premier fill → 2026-09-15 » pour EVM, et « 2025-07-01 → 2025-10-31 ou premier fill » pour Solana : ratifier, ou fixer une autre fenêtre commune (ex. 2026-07-01 → 2026-09-15 pour toutes les chaînes, comparable entre elles).
- **Q-B (valeur, investisseur)** : couverture de la course fondatrice = top 20 pools par chaîne (≈ 100 pools) ou la population entière (362 lignes, coût Chainstack et durée à mesurer au spike) ?
- **Q-C (validateur)** : ordre des sous-lots (-b1 → -b2 → -b3 proposé ; -b3 peut précéder -b2 si les rebases invalident les mesures Solana).

## Hors périmètre
T-1b (VPS, `/bell/`, clé, panneau) ; T-3 (calibration) ; lettre SEC (après T-1) ; licence d'affichage public de la clôture.

## Tuyaux (ADR-M018 D3)
RPC (Helius/Chainstack/keyless) → `collect.ts` → série D9 hors dépôt (`F:\tmp\bell-course\`, sha consigné) → série réduite committée (`series/`) → `bell_course_reduced_series_replays` → rapport MESURE-FONDATRICE → T-3. Chemin servi : aucun (U-6/T-1b). État public : `upcoming`.

## Risques (MAST)
Fenêtres non comparables entre chaînes (contre-mesure : Q-A, fenêtre déclarée par pool) ; décodeur DEX faux sans le savoir (contre-mesure : VWAP recomputé + fixture de logs par DEX + comparaison à un explorateur sur un fill) ; multiplicateur ignoré (O-8, -b3) ; quota Chainstack consommé par un `getLogs` mal borné (contre-mesure : bench §F, arrêt à 50 %) ; clôture Massive republiée par erreur (contre-mesure : `close_source` + test « aucun close dans la série »).

## Rôles
Worker Opus 4.8 max par sous-lot (worktrees `F:\Monark-wt-bell-b1/b2/b3`), G2 fraîche, checkpoint-2, G7. Checkpoint-1 : validateur, avant tout code ; Q-A/Q-B escaladées à l'investisseur en parallèle.
