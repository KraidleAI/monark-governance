# Census (A) — Aave V3 Core liquidations on USDe/sUSDe(/PT) collateral (F1) and on USDe debt (F2)

**Provenance.** Worker model `claude-opus-4-8[1m]` (resolved as-such, R-1), effort max · date 2026-09-18 · mission
"Census (A)" (MONARK) · branch `lot/census-next-piece` HEAD `72aa565` (pré-enregistrement) · reviewer = orchestrateur
(vérification adversariale R-21) · no commit (R-20). Pre-registration read AVANT le pull : `docs/PLAN-census-next-piece.md`
(hypothèses A-H1, A-H2). The audit `docs/AUDIT-next-piece-2026-09-18.md` §2 is **absent from this branch** and was read
read-only from the sibling branch `docs/audit-next-piece` (commit `e1f2842`). Read-only public keyless RPC; the only
outbound reads beyond RPC are the mission-mandated explorer cross-check (Blockscout keyless API).

Generator/script: `scripts/census/aave-liquidations.mjs` (off-CI, resumable). Raw data: `docs/census-2026-09-18/data/A-*.jsonl`.

---

## 1. Faits établis [lu] avant le pull (source = contrat/événement on-chain)

| Fait | Valeur | Source / méthode [lu] |
|---|---|---|
| Pool V3 Core | `0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2` | fourni ; validé ci-dessous |
| USDe présent dans le Pool | oui (18 déc.) | `eth_call getReservesList()` @finalized contient `0x4c9edd…68b3` ; `decimals()`=18 |
| sUSDe présent dans le Pool | oui (18 déc.) | idem contient `0x9d39a5…3497` ; `decimals()`=18 |
| `getReservesList()` | 67 réserves | décodage `address[]` ; bloc de lecture = finalized 26005649 |
| PoolAddressesProvider | `0x2f39d218133afab8f2b819b1066c7e434ad94e9e` | `eth_call POOL.ADDRESSES_PROVIDER()` |
| PoolConfigurator | `0x64b761d848206f447fe2dd461b0c635ec39ebb27` | `eth_call ADDRESSES_PROVIDER.getPoolConfigurator()` |
| Listing **USDe** | bloc **20033499** (2024-06-06) | `ReserveInitialized` topic1=USDe sur le PoolConfigurator ; tx `0x28c87433042e89d839832a84f2bf62bd1fef1328d26070706e7966b62ec269f5` — **2 fournisseurs** (tenderly + mevblocker, MATCH) |
| Listing **sUSDe** | bloc **20184634** (2024-06-27) | `ReserveInitialized` topic1=sUSDe ; tx `0x8d3393bdf789611ddddf54a8a6e38d53e8e2280e5ea36f36c1182538a0ff1261` — **2 fournisseurs** (tenderly ; mevblocker MATCH re-vérifié hors-script — voir limite †2) |
| Signature/topic `LiquidationCall` | topic0 = `0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286` | `keccak256("LiquidationCall(address,address,address,uint256,uint256,address,bool)")` — keccak inline **auto-vérifié** contre `TRANSFER_TOPIC` de `apps/sentinel/src/rpc.ts` et le vecteur `keccak256("")` ; **confirmé** par le décodeur ABI de Blockscout (§6) |
| topic0 `ReserveInitialized` | `0x3a0ca721fc364424566385a1aa271ed508cc2c0949c2272575fb3013a163a45f` | `keccak256("ReserveInitialized(address,address,address,address,address)")` |

`LiquidationCall(collateralAsset indexed, debtAsset indexed, user indexed, debtToCover, liquidatedCollateralAmount, liquidator, receiveAToken)` :
topic1=collateralAsset, topic2=debtAsset, topic3=user ; data = 4 mots (debtToCover, liquidatedCollateralAmount, liquidator, receiveAToken).

**Auto-cohérence de l'univers de réserves.** Le scan `ReserveInitialized` complet (PoolConfigurator, `[16291127, finalized]`,
1 appel tenderly) renvoie **67 events / 67 assets distincts** ; `set(RINIT assets) == set(getReservesList())`
(init∉reserves = 0, reserves∉init = 0). Aucune réserve PT-* n'a été délistée (donc « PT-* listés » = « PT-* jamais retirés »
ici), et la borne basse `AAVE_V3_DEPLOY=16291127` est validée (sinon RINIT < réserves).

### Ensembles de collatéraux (adresse → symbole on-chain)

- **F1 (pré-enregistré, base du verdict A-H1)** = `{USDe, sUSDe, PT-sUSDe*, PT-USDe*}`, 12 tokens :
  USDe, sUSDe, PT-sUSDE-{31JUL2025, 25SEP2025, 27NOV2025, 5FEB2026, 7MAY2026}, PT-USDe-{31JUL2025, 25SEP2025, 27NOV2025, 5FEB2026, 7MAY2026}.
- **F1ext (descriptif, hors verdict)** = `{eUSDe, PT-eUSDE*, PT-srUSDe*}`, 6 tokens : eUSDe, PT-eUSDE-{29MAY2025, 14AUG2025}, PT-srUSDe-{2APR2026, 25JUN2026, 22OCT2026}.
- **Exclu de F1** : `PT-USDG-28MAY2026` (collatéral non dérivé de USDe/sUSDe ; le texte de mission « PT-* listés » l'inclurait à la lettre, écarté ici car A-H1 porte sur l'exposition Ethena USDe/sUSDe).
- **F2** = `debtAsset == USDe` (dette USDe, 18 déc. lues on-chain).

---

## 2. Endpoints — dégradation mesurée de l'accès archive keyless (recherche de solutions documentée)

La couche RPC réutilisée (`scripts/usde-full-pull.mjs` : pool + cooldown + split-getLogs) reste, mais **son pool
d'endpoints s'est dégradé** pour `eth_getLogs` archive sans clé (mesuré 2026-09-18). Table verbatim :

| Endpoint | Réponse getLogs archive | Statut |
|---|---|---|
| `ethereum-rpc.publicnode.com` | `-32602 "Archive requests require a personal token"` (HTTP 403) | **inutilisable** (archive gatée) |
| `eth.llamarpc.com` | `fetch failed` (injoignable ici) | inutilisable |
| `eth-mainnet.public.blastapi.io` | `-32600 "up to a 10 block range"` | inutilisable (10 blocs) |
| `rpc.ankr.com/eth` | `-32000 "Unauthorized… API key"` | inutilisable (clé) |
| `1rpc.io/eth` | `-32001 "usage limit… plan"` | limité (plan) |
| `eth.rpc.blxrbdn.com` | `-32000 "method not available"` | pas de getLogs |
| `eth.drpc.org` | `code 35 "ranges over 10000 blocks… free plan"` | **OK, cap 10000 blocs** |
| `rpc.mevblocker.io` | sert 9998 blocs ; `-32602 "range N exceeds limit of 10000"` au-delà | **OK, cap 10000 blocs** (déjà dans le pool usde-full-pull) |
| `gateway.tenderly.co/public/mainnet` + `mainnet.gateway.tenderly.co` | sert les ranges larges, cap par **résultats** (~10000) | **OK, wide** (seul ajout au pool) |
| `flashbots.net` | n=0 là où tenderly renvoie n=1 | rejeté (non-archive) |
| `eth-pokt.nodies.app` | `"maximum allowed is 50"` | rejeté (50 blocs) |

**Décision (non un blocage).** Le déclencheur pré-enregistré « archive refusée **partout** » n'est PAS atteint : trois
fournisseurs distincts servent l'archive (tenderly.co, mevblocker.io, drpc.org). mevblocker et drpc **étaient déjà** dans
le pool usde-full-pull ; tenderly est le **seul ajout**. La *couche* est réutilisée (cooldown, split-on-result-cap,
quorum-by-`providerOf`). La note « publicnode compte pour un » devient sans objet (publicnode gaté, hors quorum).

**Fournisseurs retenus** : `tenderly.co` (résultat-capé, wide), `mevblocker.io` (cap 10000), `drpc.org` (cap 10000, 3ᵉ/repli).
Quorum = tenderly + mevblocker à **CHUNK = 9990 blocs** (≤ cap commun).

---

## 3. Méthode

- **Pull** : tous les `LiquidationCall` du Pool (topic0 seul) sur `[20033499, 26005649]` (min des listings USDe/sUSDe → finalized),
  en chunks de 9990 blocs. **26 036** `LiquidationCall` au total (dénominateur), puis filtrage F1/F1ext/F2 côté client sur les
  champs indexés (exact, sans risque de manquer un event correspondant).
- **Quorum par chunk** (mission) : chaque chunk est tiré de **2 fournisseurs distincts** (`providerOf`) ; comparaison du
  **sha256 du jeu de logs trié** `(block, logIndex, topics, data)`. Concordance → chunk propre ; divergence → les jours UTC
  des logs en différence symétrique sont marqués `disagree` ; <2 fournisseurs → chunk retenté (2ᵉ passe), puis, s'il reste
  non servi, **tous les jours UTC qu'il recoupe** sont marqués `disagree` (aucune exclusion silencieuse).
- **Fenêtre UTC = jour** ancré bloc via `apps/sentinel/src/windows.ts`. Un event est du jour dont `[fromBlock,toBlock]` contient
  son bloc (= définition sentinelle). Pour bloc ≤ 23586523 (2025-10-15) le jour est **lu gratuitement** dans la fixture
  committée `fixtures/usde-calib-series.json` (sha256 `7c33027a0e4c6a72e6b390dd95aa2396f1f8c6cdcfee22f8abe729ba8dfc9ef1`,
  même `windows.ts`) — ce qui **re-vérifie** aussi que chaque event tombe dans son jour. Au-delà : `ts` du bloc lu en quorum-2
  (les 216 events post-fixture ont tous `day_agree=true`). Bornes de mois post-fixture via `firstBlockAtOrAfter`.
- **Σ debtToCover** en unités du debtAsset (décimales lues on-chain). F2 : toujours USDe (18 déc.). F1 : par debtAsset — les
  sommes ne sont **pas additives** entre debtAssets ; agrégées par symbole. Somme USD-équivalente **uniquement pour la dette
  stable** ; 11 events F1 à dette non-stable (WETH/BTC/…) sont listés à part, sans prix inventé.
- **Coût** : garde d'arrêt à 5000 requêtes HTTP (chaque requête comptée). Aucun `eth_call` d'état archive par compte.

---

## 4. Résultats — F1 (collatéral USDe/sUSDe/PT-Ethena)

Σ debtToCover par mois et par debtAsset (unités natives ≈ USD pour les stables). `totalLiq` = tous les `LiquidationCall`
Aave ce mois-là (contexte). Toutes fenêtres `disagree=false`.

| Mois | events | users | totalLiq | Σ debtToCover (par debt) |
|---|--:|--:|--:|---|
| 2025-02 | 6 | 4 | 2494 | USDT 12 896 875 · USDC 8 511 568 |
| 2025-03 | 1 | 1 | 2547 | USDT 1 549 |
| 2025-04 | 2 | 2 | 2444 | USDT 3 822 · cbBTC ~0 |
| 2025-05 | 1 | 1 | 153 | WETH ~0 |
| 2025-07 | 2 | 2 | 181 | WETH ~0 |
| 2025-08 | 3 | 3 | 335 | WETH ~0 · USDC 116 · USDe 92 |
| 2025-09 | 1 | 1 | 298 | USDC 120 424 |
| 2025-10 | 7 | 6 | 1199 | USDC 19 846 · PYUSD 10 590 · EURC 8 105 · USDe 5 073 · USDT 3 711 · GHO 17 |
| 2025-11 | 8 | 5 | 1971 | USDC 115 723 · USDT 34 967 · GHO 1 112 · LINK 3 |
| 2025-12 | 5 | 4 | 216 | USDC 647 |
| 2026-01 | 5 | 5 | 1635 | USDC 3 323 283 · GHO 4 |
| 2026-02 | 4 | 4 | 4271 | USDT 9 477 · GHO 44 |
| 2026-03 | 3 | 3 | 345 | USDT 2 · USDe 1 |
| 2026-04 | 6 | 6 | 263 | USDe 1 368 · USDT 5 · USDC 3 · tBTC ~0 |
| 2026-05 | 5 | 5 | 374 | USDC 923 · USDe 267 · USDS 7 |
| 2026-06 | 12 | 12 | 2197 | USDT 1 351 · USDS 26 · USDe 8 · USDC 5 · wstETH ~0 |
| 2026-07 | 3 | 3 | 65 | USDC 186 · USDT 94 · wstETH ~0 |
| 2026-08 | 4 | 3 | 239 | USDT 29 · WETH ~0 |
| 2026-09 | 1 | 1 | 81 | USDC 11 |

**Grand total F1** : Σ dette-stable ≈ **25 071 333 USD-eq** sur 68 events (+ 11 events dette-non-stable). Les deux SEULS jours
UTC ≥ 1 M USD-eq : **2025-02-21 (~21 382 588)** et **2026-01-19 (~3 322 389)**.

---

## 5. Résultats — F2 (dette = USDe)

Σ debtToCover en USDe (18 déc.). Toutes fenêtres `disagree=false`.

| Mois | events | users | totalLiq | Σ debtToCover (USDe) |
|---|--:|--:|--:|--:|
| 2024-08 | 10 | 10 | 2332 | 3 704 479 |
| 2024-12 | 3 | 2 | 377 | 1 342 |
| 2025-01 | 2 | 2 | 347 | 1 751 |
| 2025-02 | 16 | 15 | 2494 | 441 426 |
| 2025-03 | 25 | 24 | 2547 | 237 890 |
| 2025-04 | 13 | 11 | 2444 | 166 304 |
| 2025-06 | 2 | 2 | 325 | 1 708 |
| 2025-08 | 3 | 2 | 335 | 287 |
| 2025-09 | 2 | 2 | 298 | 21 |
| 2025-10 | 9 | 7 | 1199 | 73 668 |
| 2025-11 | 17 | 15 | 1971 | 88 984 |
| 2025-12 | 5 | 5 | 216 | 135 |
| 2026-01 | 15 | 14 | 1635 | 2 295 402 |
| 2026-02 | 43 | 38 | 4271 | 651 758 |
| 2026-03 | 12 | 11 | 345 | 518 637 |
| 2026-04 | 15 | 8 | 263 | 257 146 |
| 2026-05 | 5 | 5 | 374 | 2 623 |
| 2026-06 | 39 | 38 | 2197 | 118 564 |
| 2026-07 | 3 | 3 | 65 | 741 |
| 2026-08 | 1 | 1 | 239 | 114 |
| 2026-09 | 4 | 4 | 81 | 2 170 |

**Grand total F2** : Σ ≈ **8 565 150 USDe** sur 244 events (162 après 2025-10-15). Jours max : 2024-08-05 (~3.70 M),
2026-01-31 (~2.22 M), 2026-03-11 (~0.51 M), 2025-02-03 (~0.42 M).

---

## 6. Zoom 2025-10-09 → 2025-10-13 (épisode de dé-peg USDe ; Binance ~0,60 $ le 10-11, LlamaRisk)

| Jour | F1 events | F1 Σ debtToCover | F2 events | F2 Σ (USDe) |
|---|--:|---|--:|--:|
| 2025-10-09 | 0 | — | 0 | — |
| 2025-10-10 | 5 | USDC 19 846 · PYUSD 10 590 · EURC 8 105 · USDe 5 073 | 3 | 12 505 |
| 2025-10-11 | 1 | GHO 17 | 2 | 3 584 |
| 2025-10-12 | 0 | — | 0 | — |
| 2025-10-13 | 0 | — | 0 | — |

Toutes `disagree=false`. Sur l'épisode de dé-peg : F1 ≈ **43 600 USD** (10-10) puis **~17 USD** (10-11) ; F2 ≈ **12 505 USDe**
(10-10) puis **3 584 USDe** (10-11) — négligeable.

**Preuve on-chain du fait pivot (oracle Aave, `AaveOracle 0x54586be62e3c3580375ae3723c145253060ca0c2` = `getPriceOracle()`).**
`getAssetPrice` (8 déc. USD) mesuré pendant le dé-peg : USDe = **$1,0003** (bloc 23547000, 10-10) et **$1,0006** (bloc 23554000,
10-11) ; sUSDe = **$1,2020** puis **$1,2026**. L'oracle est resté ~1 $ pendant que le marché affichait ~0,60 $ (LlamaRisk) : le
feed sous-jacent n'a **pas** enregistré la dislocation Binance ⇒ health factors non touchés ⇒ ~0 liquidation. C'est la
confirmation [lu] du fait pivot de l'audit §2 **pour cet épisode précis** — voir §7 pour la portée (le cap borne le haut,
pas le bas).

---

## 7. Verdicts

### A-H1 — **FALSIFIÉE** (à la lettre de la règle pré-enregistrée), avec nuance de mécanisme

Règle pré-enregistrée : Σ debtToCover(F1) ≈ 0 sur toute fenêtre UTC depuis le listing ; **falsifie = ≥ 1 fenêtre ≥ 1 M USD-eq**.
Mesuré : **2 fenêtres** dépassent 1 M USD-eq — **2025-02-21 ≈ 21,38 M** et **2026-01-19 ≈ 3,32 M**. Le critère de falsification
est atteint ⇒ **A-H1 falsifiée**.

Détail (vérifiable, cf. §8) :
- **2025-02-21** — 5 liquidations, **collatéral sUSDe** saisi, dette stable : sUSDe/USDT **12 871 020** (tx `0x6290d4…333c`),
  sUSDe/USDC 7 461 075, 543 296, 276 956, 230 241.
- **2026-01-19** — 1 liquidation sUSDe/USDC **3 322 389** (tx `0xeb20d0…4aff`).

**Mécanisme — MESURÉ on-chain (`eth_call` archive ; corrige une inférence initiale, non mesurée, qui était fausse).** Les
deux comptes liquidés sont des **boucles à collatéral ~100 % sUSDe** empruntant des stablecoins, au health factor rasant —
pas des positions à collatéral mixte :
- User `0x438403a3…` @bloc 21895692 (2025-02-21) : `getUserAccountData` → totalCollateralBase **73 749 664 $** (dont ~100 %
  en sUSDe : aToken `0x4579a27a…`, solde 64 848 630 sUSDe), totalDebt **67 637 213 $**, liqThreshold 92 %, **HF = 1,0031**.
  L'oracle a **baissé** ce jour-là : `getAssetPrice(sUSDe)` **1,1568 $ → 1,1312 $** (−2,2 %, contrôle J-1 → bloc event) ;
  USDe **0,9995 $ → 0,9772 $**. ⇒ liquidation **pilotée par l'oracle** (une décote USDe/sUSDe réelle a franchi le feed).
- User `0x08c14b32…` @bloc 24266438 (2026-01-19) : totalCollateral **14 871 126 $**, totalDebt **13 666 908 $**, **HF = 1,0011** ;
  oracle sUSDe **inchangé** (1,2161 $ → 1,2162 $) ⇒ liquidation par **accumulation d'intérêts / micro-mouvement** sur une
  boucle déjà au bord.

**Conséquence sur le fait pivot de l'audit — le « measured » le nuance.** L'audit §2 énonce « un choc de prix secondaire sur
USDe **ne se propage jamais** au HF … outcome réalisé ≈ 0 **par construction** ». Le mesuré **contredit ce « jamais »** :
l'oracle « Capped USDT/USD » **borne le haut** (USDe ≤ USDT/USD) mais **laisse passer les décotes** que le feed sous-jacent
enregistre — une décote de ~2,2 % le 2025-02-21 a liquidé **21,4 M$** de boucles sUSDe au levier maximal. Il n'a **pas**
enregistré la **dislocation Binance spécifique** du 2025-10-10/11 (feed resté ~1 $, §6), d'où ~0 liquidation **sur ce seul
épisode**. Énoncé correct et mesuré : *le prix comptable Aave immunise contre les dislocations qui n'atteignent pas son feed,
pas contre toute décote USDe.* Les grandes fenêtres F1 sont des liquidations de **boucles sUSDe/USDe au levier maximal**
(HF ≈ 1,00, dette stable), déclenchées par une petite décote d'oracle ou l'accumulation d'intérêts ; leur taille en $ reflète
la taille des boucles, pas un run systémique. (Le « jour de l'exploit Bybit » n'est PAS établi ici comme cause — non mesuré,
écarté.)

### A-H2 — **TENUE** (|ρ| < 0,2)

Spearman de rang (midranks + Pearson-sur-rangs, correct sous ex æquo ; auto-testé ±1) entre `y_t` = Σ debtToCover(F2)/jour
et `v_t` = `v_t_per_hr` de la fixture, sur les **jours communs** [2024-06-06 (listing USDe) → 2025-10-15] : **n = 497**,
`v_t` non-null pour tous (0 rejeté), **465 jours à y_t = 0**. **ρ(Σ debtToCover) = 0,1422** ; ρ(nombre d'events) = 0,1415.
|ρ| < 0,2 ⇒ **A-H2 tenue** (règle pré-enregistrée sur les jours communs).

**Robustesse / faiblesse déclarée.** La statistique est **dégénérée sous 465/497 = 93,6 % d'ex æquo à y_t = 0** (elle revient
à « les 32 jours à liquidation avaient-ils un v_t supérieur à la médiane »). Sur les **seuls jours à liquidation** (y_t > 0,
n = 32), ρ = **0,483** (association modérée). Le verdict pré-enregistré tient à 0,142 ; mais le lien **n'est pas nul quand des
liquidations existent** — à signaler, sans changer la règle.

---

## 8. Cross-check obligatoire (explorateur indépendant — Blockscout keyless)

1. **Décodage** (mon pull → explorateur) : top event F2 `0xde4900…d55c` (2024-08-05, WETH→USDe, 2 759 407,36 USDe).
   `GET https://eth.blockscout.com/api/v2/transactions/0xde4900…d55c/logs` (HTTP 200) : Blockscout décode le **même**
   `LiquidationCall(...)`, collatéral WETH, dette USDe, debtToCover **2759407362617450291048356** — MATCH sur les 3 ;
   `block_timestamp` 2024-08-05T06:24:35Z confirme l'affectation de jour.
2. **Complétude** (explorateur → mon pull) : `GET /api/v2/addresses/0x8787…4E2/logs?topic=<LIQ>` renvoie 50 liquidations
   récentes ; les **8 vérifiées (2026-09-18) sont toutes dans `A-rawlogs.jsonl`** (8/8), y compris le jour UTC partiel du jour.
3. **Fenêtre de falsification A-H1** : l'event de tête `0x6290d4…333c` (2025-02-21) est confirmé sur Blockscout —
   collatéral `0x9d39a5…3497` (sUSDe), dette `0xdac17f…ec7` (USDT), debtToCover **12871019904705** (=12 871 019,9 USDT),
   date 2025-02-21 — MATCH.

---

## 9. Provenance / reproductibilité

- **Endpoints utilisés** : `tenderly.co` (gateway + mainnet, un fournisseur), `mevblocker.io`, `drpc.org`. Setup/headers via
  la même couche. Cross-check : `eth.blockscout.com` (keyless, hors compteur RPC).
- **Nombre d'appels RPC** : **2142** pour le pull/agrégat (< garde 5000). Setup 151, pull ~1687 (598 chunks × 2 + splits/retries),
  bornes de mois + ts d'events post-fixture le reste. **+ ~25 `eth_call` archive hors-pull** (mécanisme §7 : `getPriceOracle`,
  `getAssetPrice`, `getUserAccountData`, `getReserveData`, `balanceOf` aux blocs de dé-peg et de breach) et les vérifs
  d'explorateur/listing — lecture seule, sans clé, non compris dans le compteur du script.
- **Quorum** : **598/598 chunks servis par tenderly.co + mevblocker.io** (paires : `{"mevblocker.io+tenderly.co":598}`) ;
  **drpc.org n'a servi aucun chunk** (3ᵉ/repli, jamais nécessaire → pas une redondance effective). **0 divergence de chunk** ;
  74 chunks `quorum_unavailable` en 1ʳᵉ passe (1 seul fournisseur momentané) **tous récupérés en 2ᵉ passe** ⇒
  `quorumUnavailable = 0`, `missing = 0`. Le quorum a donc reposé sur **2 fournisseurs réellement distincts** sur toute la plage.
- **Fenêtres `disagree`** : **0** (aucun jour marqué ; ni divergence ni indisponibilité résiduelle).
- **Fixture v_t** : `fixtures/usde-calib-series.json` sha256 `7c33027a0e4c6a72e6b390dd95aa2396f1f8c6cdcfee22f8abe729ba8dfc9ef1`.
- **sha256 des JSONL** (`docs/census-2026-09-18/data/`) :
  - `A-rawlogs.jsonl` (26036 lignes, tous les LiquidationCall) `d0f4aa1e23a3eaed6375dca4e6564b7123dfc9ed9b303c1cb7de84dbdae1a996`
  - `A-chunks.jsonl` (598) `35b4b721d4263f1b51a1077956c0480fca9d630ce3e5edd5da6cb0851d5dcff2`
  - `A-events.jsonl` (318 events uniques F1∪F1ext∪F2 ; 331 appartenances, 13 events dans 2 filtres) `bad429346ad0cf39f81366bf774af978f72a93dddff5cd8df3d3519f606c3d78`
  - `A-windows.jsonl` (226 agrégats jour×filtre + mois×filtre) `e04141a1e11d543142b3b9d8087b8f43b2026f33fa315fa7c9c441d751f52a01`
- **Reproduction** : `CENSUS_CACHE=<tmp> node scripts/census/aave-liquidations.mjs` (résumable, off-CI). keccak inline
  auto-vérifié contre `TRANSFER_TOPIC` de `apps/sentinel/src/rpc.ts` au démarrage.
- **État du dépôt à l'écriture** : `git rev-parse HEAD` = `72aa565bb1e8d86fb3e85a3599d6ecc67ae1db6b`, branche
  `lot/census-next-piece` (pré-enregistrement, inchangé ; le worker ne committe pas — R-20).
- **Jour partiel** : 2026-09-18 est un jour UTC partiel (→ finalized 26005649) ; inclus, non fusionné.

### Écarts / limites déclarés (zéro dette)
1. **Endpoint pool** : dévié comme documenté au §2 (dégradation archive keyless mesurée) — recherche de solutions jointe,
   pas un contournement. Couche RPC réutilisée ; tenderly seul ajout ; mevblocker/drpc déjà dans le pool.
2. **Vérif listing sUSDe intra-script** (cf. renvoi † du tableau §1) : le summary machine du run porte
   `sUSDe.mevblocker_verified=false` — artefact d'une fenêtre de vérif à 10001 blocs > cap mevblocker (bug cosmétique, sans
   effet sur les données). Le bloc **20184634 a été re-vérifié hors-script sur mevblocker** (fenêtre 20179644–20189624, ≤ 9990)
   → MATCH, tx `0x8d3393…1261`. Le script a été **corrigé** (`verifyListing` : ±4990 au lieu de ±5000) — **corrigé post-run,
   non ré-exécuté** ; un re-run rendrait `mevblocker_verified=true`. USDe : déjà `true` au run.
3. **F1 dette non-stable** (11 events, WETH/cbBTC/tBTC/wstETH/LINK) : montants en unités natives dans `A-events.jsonl` ;
   **non convertis en USD** (pas de source de prix) — exclus du Σ USD-eq et du test de seuil A-H1 (aucun n'atteint 1 M de toute façon).
4. **`PT-USDG-28MAY2026`** écarté de F1 (non-Ethena) ; consigné.

*Aucune phrase publique. Aucun « aurait alerté ». Données brutes pour l'orchestrateur (R-21).*
