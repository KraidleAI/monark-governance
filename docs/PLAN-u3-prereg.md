# PLAN U-3 — pré-enregistrement des étiquettes réelles Y_{i,e} (Ukemi, ADR-M020 D1 (b))

## 0. Provenance et chronologie
Worker `claude-opus-4-8[1m]` (résolu tel quel, R-1), effort max · 2026-09-20 · mission **lot U-3** (MONARK/Ukemi) ·
worktree `F:\Monark-wt-u3`, branche `lot/u-3`, base `13b8391` · réviseur = orchestrateur (vérif adversariale R-21) ·
**aucun commit, aucun workflow (R-20)**. Plan qui fait foi : `docs/G0-lot-u3.md` + amendement checkpoint-1 C-1..C-11
(`docs/CHECKPOINT1-lot-u3.md`).

**Chronologie vérifiable (C-10, imposé par le système).** Ce document est rédigé **AVANT tout appel réseau**. Son
`sha256` **LF** (fichier entier, `\r\n → \n`) est consigné dans le rapport du worker et committé **seul** en premier par
l'orchestrateur. Le script `scripts/census/u3-realized.mjs` **refuse de démarrer** sans `--prereg-sha` égal à ce sha LF, et
l'inscrit dans le manifeste des bruts et dans `U3-inputs.jsonl`. Recette du sha (identique à celle du test
`series_pinned`) : `node -e "process.stdout.write(require('fs').readFileSync('docs/PLAN-u3-prereg.md','utf8').replace(/\r\n/g,'\n'))" | sha256sum`.
Aucune ligne de ce fichier n'est modifiée après le calcul du sha ; toute note a posteriori va dans `docs/census-2026-09-20/U3-realized.md`.

## 1. Entrées immuables (sha256, lecture locale — pas réseau)
| Entrée | Rôle | sha256 |
|---|---|---|
| `docs/census-2026-09-18/data/A-rawlogs.jsonl` (gitignoré) | 26 036 `LiquidationCall` tout collatéral (dénominateur) ; source des 3 événements (C-1) | `d0f4aa1e23a3eaed6375dca4e6564b7123dfc9ed9b303c1cb7de84dbdae1a996` |

Le script prend `--rawlogs <chemin absolu>` et **vérifie ce sha au démarrage** (arrêt sinon). Blocs de A-rawlogs :
20 035 039 → 26 003 741 (vérifié localement).

## 2. Constantes épinglées (from [lu] on-chain — census A §1, M-2b §2, `apps/sentinel/src/ukemi/clusters.ts`)
- **Pool** `0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2` · **PoolAddressesProvider** `0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e`
  · **PoolConfigurator** `0x64b761d848206f447fe2dd461b0c635ec39ebb27` · **AaveOracle** `0x54586bE62E3c3580375aE3723C145253060Ca0C2`
  (résolue on-chain via `getPriceOracle()` @B, jamais codée).
- Actifs : WETH `0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2` · sUSDe `0x9D39A5DE30e57443BfF2A8307A4256c8797A3497`
  · USDe `0x4c9EDD5852cd905f086C759E8383e09bff1E68B3` · USDC `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`
  · USDT `0xdac17f958d2ee523a2206206994597c13d831ec7`. aTokens résolus on-chain via `getReserveData(asset)@B` (word 8),
  jamais codés ; variableDebtToken = word 10 (`apps/sentinel/src/ukemi/abi.ts` `decodeReserveData`).
- **Topics (keccak-256 self-testé dans le script, jamais collé seul)** : `LiquidationCall(address,address,address,uint256,uint256,address,bool)`
  = `0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286` ; `DeficitCreated(address,address,uint256)`
  = `0x2bccfb3fad376d59d7accf970515eb77b2f27b082c90ed0fb15583dd5a942699` (ADR-M020 D6) ; `Transfer(address,address,uint256)`
  = `0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef` (`rpc.ts` `TRANSFER_TOPIC`) ; `Upgraded(address)`
  = `0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b`.
- **Sélecteurs (keccak self-testé)** : `getAssetPrice(address)` `0xb3596f07` · `getSourceOfAsset(address)` `0x92bf2be0`
  · `description()` `0x7284e416` · `balanceOf(address)` · `getReserveData(address)` · `getReservesList()` · `getPriceOracle()`
  · `BASE_CURRENCY_UNIT()` (lu on-chain sur l'AaveOracle, C-9, jamais « 1e8 » codé).

## 3. Définition pré-engagée des 3 événements (C-5 ; position = `(user, debtAsset, collateralAsset)`)
Fenêtre 24 h **ancrée bloc** (classe M020 D1 (b)) : `B_first` = premier `LiquidationCall` du cluster (déterministe depuis
A-rawlogs, sans réseau) ; `B_last = firstBlockAtOrAfter(ts(B_first)+86400) − 1` (`apps/sentinel/src/windows.ts`
`firstBlockAtOrAfter`, `ts` de bloc lu en **quorum-2**). Lignes du cluster de bloc ∈ [B_first, B_last] = **retenues** ;
lignes de bloc ∈ (B_last, cluster_hi] = résidu **`outside_window`** (comptées, hors Σ).

### e1 — 2025-02-21, collatéral sUSDe
Cluster = `LiquidationCall` collatéral = sUSDe, blocs {21895671, 21895693} (2 blocs). **B_first = 21895671**. **5 appels /
3 positions**, tous `receiveAToken=false`. debtAssets = USDC, USDT. Max bloc 21895693 ≪ B_first+7200 ⇒ **les 5 appels sont
in-window** (n attendu 5/3, `outside_window`=0). **Pré-v3.3** (v3.3 déployé 2025-02-24, ADR-M020 D6 ; 2025-02-21 < déploiement)
⇒ **`deficit_topic_absent` par construction** (C-6) ; confirmé par le log `Upgraded` ≤ B_first (quorum-2). Détail des 5 appels
(A-rawlogs, [lu local]) :

| bloc | logIndex | debt | user | debtToCover (natif) | tx |
|---|---|---|---|---|---|
| 21895671 | 17 | USDC | `0xaa643c73d54d8c9f9dfdc50250a78a89fc044ab0` | 230241154337 | `0x49f5cf441d488a0775f769ea6718f09a48e845c029f3bd32be0fdb9291045106` |
| 21895693 | 13 | USDC | `0xbbacb7f97ba96aa90e5603cfb47eae09517c8731` | 276956487719 | `0x82b48989b1de7c775dcca9a4860f713fbd0844507969cedcb1aed54f42cf2193` |
| 21895693 | 39 | USDC | `0xbbacb7f97ba96aa90e5603cfb47eae09517c8731` | 543295787571 | `0x71e03fb5fea735946d584b8bc33305230f1d1a52f6bb1aab7def6b7368e630d7` |
| 21895693 | 274 | USDT | `0x438403a3ba8815d1707145d8052820d56f0c8240` | 12871019904705 | `0x6290d4028bf14913b2b079de8e3b589b3245c6a67c9faca16c406e28ce6e333c` |
| 21895693 | 306 | USDC | `0xbbacb7f97ba96aa90e5603cfb47eae09517c8731` | 7461075063509 | `0xeb230bbe34324715376cdacb672b8f8b5ff5ecc7c6ebe76811db69cb645315eb` |

Positions : (aa643c73, USDC, sUSDe) 1 appel ; (bbacb7f9, USDC, sUSDe) 3 appels ; (438403a3, USDT, sUSDe) 1 appel = **3 positions**.

### e2 — 2025-10-10/11, collatéral WETH (krach exogène)
Cluster = `LiquidationCall` collatéral = WETH, bloc ∈ **[23545088, 23557060]** (M-2b §2.4, sha-pinné ; **reproduit depuis
A-rawlogs : 268 appels, 119 blocs distincts, 213 users, 219 positions** — MATCH M-2b). **Gap net de 2839 blocs** avant
23545088 (les liquidations WETH pré-krach 23541082→23542249 sont **hors cluster**). **B_first = 23545088**. Fenêtre 24 h
`[23545088, B_last]`, B_last résolu par le script (quorum-2 ts). **n attendu (proxy 7200 blocs) : ≈239 appels / ≈194 positions,
`outside_window` ≈29** — le proxy 7200 donne 239/194/29 ; le « ≈189 » du checkpoint C-5 était approximatif ; **l'exact est
mesuré** (B_last réel). Tous `receiveAToken=false` (268/268). debtAssets multiples.

**Ancres pré-chiffrées Σ debtToCover par debtAsset — CLUSTER PLEIN [23545088, 23557060]** (falsifiable ; le script doit
reproduire ces sommes sur le cluster) :

| debtAsset | Σ debtToCover (natif, cluster) |
|---|---|
| `0x1abaea1f7c830bd89acc67ec4af516284b1bc33c` | 29460111821 |
| `0x2260fac5e5542a773aa44fbcfedf7c193bc2c599` | 163964266 |
| `0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f` | 347351321419603880352616 |
| `0x4c9edd5852cd905f086c759e8383e09bff1e68b3` | 3149474628084093755545 |
| `0x6b175474e89094c44da98b954eedeac495271d0f` | 448724566511017601506147 |
| `0x6c3ea9036406852006290770bedfcaba0e23a0e8` | 17755760392 |
| `0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0` | 18804016903389218409 |
| `0x8292bb45bf1ee4d140127049757c2e0ff06317ed` | 11723986516504324031887 |
| `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48` | 16928453785811 |
| `0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2` | 25027352923654102386 |
| `0xc139190f447e929f090edeb554d95abb8b18ac1c` | 5772391561739853070568 |
| `0xc18360217d8f7ab5e7c516566761ea12ce7f9d72` | 7849171624459584642525 |
| `0xd533a949740bb3306d119cc777fa900ba034cd52` | 1846489549481666819139101 |
| `0xdac17f958d2ee523a2206206994597c13d831ec7` | 5485087810739 |

La Σ **in-window** (24 h) est un **sous-ensemble** de ces ancres, mesurée par le script après résolution de B_last ;
non pré-chiffrée à l'unité (dépend de B_last réseau) — c'est le sens de « e2 à fixer au prereg » (C-10) : règle + ancres
cluster pré-engagées, sommes in-window mesurées.

### e3 — 2026-01-19, collatéral sUSDe
Cluster = `LiquidationCall` collatéral = sUSDe autour de 2026-01-19. **B_first = 24266439**, **1 appel / 1 position**,
`receiveAToken=false`, debt USDC, user `0x08c14b32c8a48894e4b933090ebcc9ce33b21135`, dtc **3322388532587**,
tx `0xeb20d0c26ced90677aca1b47f2019cd21d0d4a1652b3b0aa1d03ec6a873b4aff`. **La liquidation sUSDe/USDT du bloc 24384982
(user 0x755a513d, dtc 8549246498) est un événement DISTINCT** (~118 543 blocs plus tard, hors fenêtre 24 h) : **exclue**.
**Post-v3.3.**

## 4. Hypothèses pré-enregistrées
- **U3-H1** — `DeficitCreated` apparaît dans **≥ 1 des 2 événements post-v3.3** (e2, e3) **OU** le contrôle positif externe
  s'allume (§6). e1 exclue (pré-v3.3, `deficit_topic_absent`). Attente déclarée : e2/e3 sont des boucles HF ≈ 1,00
  remboursées, probablement **sans déficit** ; si tel est le cas, le contrôle positif (CAPO, §6) prouve que le filtre attrape.
- **U3-H2** — la source d'oracle par actif est **constante** dans les 24 h de chaque événement. Sources attendues (M-2b, [lu],
  falsifiable ; les bascules connues sont **hors** de ces fenêtres) :
  - e1 (pré-bascule 22002625) : sUSDe `0xb37ae8ab…` desc `"Capped sUSDe / USDe / USD"` ; USDe `0x55b6c4d3…` (feed marché) aux **deux** bornes.
  - e2 : WETH `0x5424384b256154046e9667ddfaaa5e550145215e` (feed SVR) desc `"ETH / USD"` aux deux bornes.
  - e3 (post-bascule) : sUSDe `0x42bc86f2…` desc `"Capped sUSDe / USDT / USD"` aux deux bornes.
  « Bissection » (C-10) = contrôle aux **deux bornes** (B_first−1, B_last) ; bissection réelle seulement si les bornes diffèrent.
- **U3-H3 (identité de pipeline, pré-chiffrée C-10)** — pour chaque événement, Σ `repayment` natif par `(événement, debtAsset)`
  sur les lignes **retenues** in-window = Σ `debtToCover` des **mêmes** lignes de A-rawlogs, à l'unité :
  - **e1 : USDC 8511568493136 + USDT 12871019904705** (pré-chiffré exact, toutes in-window).
  - **e3 : USDC 3322388532587** (pré-chiffré exact).
  - e2 : mesurée (sous-ensemble in-window des ancres §3.e2) ; identité vérifiée au runtime (repayment natif retenu = debtToCover retenu).

## 5. Méthode et arithmétique pré-enregistrées
- **Prix** : `getAssetPrice(asset)@bloc` du log (jamais un prix moyen, C-9 / M020 D2), cache par `(asset, bloc)`. Montant base :
  `repayment_base = floor(debtToCover × getAssetPrice(debtAsset)@bloc / 10^decimals(debtAsset))` (BigInt, arrondi **plancher**) ;
  `seized_base = floor(liquidatedCollateralAmount × getAssetPrice(collateralAsset)@bloc / 10^decimals(collateralAsset))`.
  Unité base = `BASE_CURRENCY_UNIT()` lu on-chain (8 déc.). Sommes **natives** aussi conservées (U3-H3).
- **`price_moved_in_block`** (C-9) : `getAssetPrice@bloc` vs `@(bloc−1)` ; différence ⇒ résidu `price_moved_in_block`
  (compté, **non corrigé**). Hypothèse déclarée : « pas d'update d'oracle après la liquidation dans le même bloc »
  (M-2b §4.2/§4.6 : feed WETH = SVR backrun-only ⇒ l'update précède la liquidation qu'elle backrun).
- **Croisement C-7 (underlying ERC-20)** via `eth_getTransactionReceipt` par tx de `LiquidationCall` (quorum-2, octets
  triés identiques ; déduplication par tx) — le receipt porte `LiquidationCall` + les `Transfer` underlying + tout
  `DeficitCreated` de la même tx. Appariement **multiset** par `(from, to, amount)`, chaque `Transfer` consommé une fois
  (une tx à N `LiquidationCall` a N `Transfer` repayment et N seized) :
  - `repayment` ⇔ `Transfer(liquidator → aToken(debtReserve), debtToCover)` sur l'ERC-20 du debtAsset ;
  - `seized` ⇔ `Transfer(aToken(collateral) → liquidator, liquidatedCollateralAmount)` sur l'ERC-20 du collatéral quand
    `receiveAToken=false` (tous les cas mesurés) ; `seized` **exclut le frais protocole** (treasury). Les `Transfer` des
    tokens scaled (aToken/debtToken) sont nets de `balanceIncrease` (V-8) ⇒ jamais égaux à l'unité, **non utilisés**.
  - Écart ⇒ résidu **`xfer_mismatch`**, jamais tolérance muette. Leg littéral L-2 conservé : `getLogs(Pool, DeficitCreated,
    [B_first,B_last])` (~1 chunk quorum-2) puis **égalité d'ensemble** avec les `DeficitCreated` extraits des receipts.
- **Déficit C-8** : `DeficitCreated(borrower, debtAsset, amount)`, clé `(user, debtAsset, block, tx, amount)` ; jointure par
  debtAsset/tx à la position ; déficits d'autres réserves (`_burnBadDebt`) ⇒ lignes `bad_debt_other_reserve` rattachées au
  `user` (pas à un collatéral).
- **`partial_liquidation` C-9** : `balanceOf(variableDebtToken(debtAsset), user)@B_last > 0` ⇒ résidu `partial_liquidation` ;
  variableDebtToken via `getReserveData(debtAsset)@B_last` word 10 (`abi_mismatch` fail-closed si struct trop courte).
- **Implémentation du Pool C-6** : dernier `Upgraded(impl)` ≤ B_first sur le proxy Pool (quorum-2) ⇒ impl + bloc + tx [lu].
  Le mapping vers la release taguée = item formé (web/[2nd]) si non tiré. Un receipt par événement **vérifié Blockscout**
  (keyless, hors compteur RPC) **avant** généralisation : e1 `0x6290d4…333c`, e2 (une tx @23545088), e3 `0xeb20d0…4aff`.
- **Quorum-2 par méthode** (ADR-U1 D3 ; deux **opérateurs** distincts par `providerOf`) : `eth_call`@B servi par
  {archive env (CHAINSTACK) + drpc + mevblocker + blastapi} ; `eth_getLogs`/receipt par {archive env + drpc + mevblocker}.
  Concordance = octets identiques (ou même revert EVM concordant, toléré seulement pour `description()`, `""` au digest) ;
  sinon `no_quorum` ⇒ **ligne abstenue** (résidu `no_quorum`, montants `null`, hors Σ et hors U3-H3, **comptée**), jamais
  partielle. Politesse ≤ 300/min. Fournisseurs keyless = ceux de `apps/sentinel/src/rpc.ts` (réutilisé sans le toucher).
- **Budget** : `--max-calls` **obligatoire**, fail-closed (abort + cache persisté, **resumable**). Recommandé **4000**
  (estimation : setup ~10, ts ~90, sources 2 bornes × ~19 actifs × 2 ~150, receipts ~245×2, prix ~250 paires ×2 ×2 ~1000,
  balanceOf ~400 ⇒ ~2200 avant retries).
- **Discipline URL/secret** : aucune clé, aucune URL jamais imprimée ; tout message d'erreur réécrit en `providerOf(url)`
  (domaine seul) ; leg archive env journalisé en **booléen**. Bruts RPC **hors dépôt** sous `F:\PRODUITS\etude-2026-09-20\u3-raws\`,
  sha-pinnés dans `PROVENANCE-u3.md` ; séries réduites in-repo (C-2/C-3).

## 6. Contrôle positif du déficit (C-8, obligatoire)
Si aucun `DeficitCreated` n'apparaît dans les receipts de e2/e3, le script exécute un **contrôle positif externe** :
`getLogs(Pool, [DeficitCreated], [24626860−R, 24626860+R])` (bloc CAPO, ADR-M020 PR-UK-3 : 512,19 ETH de bad debt ;
tx d'exécution `0x32c64151…5a1e` @24626860), R élargi déterministe si vide dans `--max-calls`, et **épingle le log
`DeficitCreated` décodé** dans `U3-inputs.jsonl` en `kind:"positive_control"`. Prouve que topic + décodeur attrapent une
émission réelle. Mutant (C-8) : topic altéré ⇒ contrôle positif rouge.

## 7. Livrables et emplacements (liste fermée)
- Séries réduites sha-pinnées (C-2, racine déjà exclue R-25) : `apps/sentinel/test/fixtures/ukemi/u3/` — `U3-realized.jsonl`
  (une ligne par `(i,e)` : `user, event_id, debtAsset, collateralAsset, repayment_base, seized_base, deficit_base, n_calls,
  first_block, last_block, oracle_source_debt, oracle_source_collateral, residual[]`), `U3-sources.jsonl`, `U3-deficit.jsonl`,
  `U3-inputs.jsonl` (entrée réduite de rejeu CI, C-3), `PROVENANCE-u3.md` (same-dir, D9 sexies).
- Rapport `docs/census-2026-09-20/U3-realized.md` (L-4) · ADR `docs/adr/ADR-U3-realized-labels.md` (L-5) · `docs/PLI-lot-u3.md` (L-6).

## 8. Falsifieurs et seuils
- U3-H1 falsifiée si **ni** e2 **ni** e3 n'ont de `DeficitCreated` **et** le contrôle positif échoue (topic faux).
- U3-H2 falsifiée si une source diffère entre les deux bornes d'un événement.
- U3-H3 falsifiée si la Σ `repayment` native ≠ Σ `debtToCover` des lignes retenues (tout debtAsset) — mutant « ligne retirée ⇒ rouge ».
- **Dunn (L-4, aucune conclusion sur α — décision U-4)** : n_e (positions) vs Thm 11 (`n > 1/α − 1`) : **99** à α=0,01 ;
  **19** à 0,05 ; **9** à 0,10. e1 = 3 ; e2 ≈ 189-194 ; e3 = 1. **Seul e2 dépasse 99** (avant stratification Mondrian).

## 9. Tuyaux (ADR-M018 D3) et branchement (CA-11)
census A + RPC quorum-2 → `u3-realized.mjs` → `U3-realized.jsonl` → **consommé par U-4** (calibration) et U-7 (papier).
État = **`annex`** jusqu'à U-4 (jamais `built`) ; `fleet.ts` inchangé. Le test d'intégration du tuyau est celui de U-4
(nom réservé, nommé dans ADR-U3, écrit en U-4).
