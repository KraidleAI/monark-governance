# MESURES M-2b — événement WETH 2025-10-10/11 + bissection de la source d'oracle (sUSDe/USDe, LST/LRT)

## 0. Provenance
Worker `claude-opus-4-8[1m]` (résolu tel quel, R-1), effort max · 2026-09-19 · mission **mesure** (MONARK/Ukemi) ·
dépôt de session `F:\Shogen` mais **aucune écriture en dépôt** (sorties sous `F:\Monark\docs\biblio\ukemi-modeL\`) ·
réviseur = orchestrateur (vérif adversariale R-21) · **aucun commit, aucun workflow (R-20)**. Advisor-DeFi consulté
2026-09-19 (avis intégré, conseil non-verdict ; ses recommandations d'ordre intra-bloc sont **reçues et amendées** au
vu d'un fait on-chain contraire, §2.3). `memstack` injoignable cette session (ConnectionRefused) — non bloquant.

**Chronologie vérifiable.** §0–§3 (constantes + hypothèses + règles de décision) sont écrits **AVANT** toute mesure ;
le fichier est haché à la borne `<!-- PREREG-END -->` et le digest déposé dans `scripts-mesure/m2b/out/prereg.sha256.txt`
**avant** l'exécution des scripts. Les résultats sont en §4, ajoutés ensuite. Interdits tenus : aucun « aurait », aucun
score, aucune extrapolation hors fenêtre, et **le mot « cascade » (ni « pré-cascade ») n'apparaît nulle part** ici, dans
les scripts, ou le rapport.

## 1. Entrées immuables (sha256)
| Entrée | Rôle | sha256 |
|---|---|---|
| `docs/census-2026-09-18/data/A-rawlogs.jsonl` | 26036 `LiquidationCall` (tout collatéral) | `d0f4aa1e23a3eaed6375dca4e6564b7123dfc9ed9b303c1cb7de84dbdae1a996` |
| `scripts-mesure/out/m2-results.json` | résultats M-2 (source des IC95 et du bootstrap à rejouer) | `4e4f64a100ebcb6d158b9bcca8b9ddd9e98761ebb0c6167584532405d00acba4` |

## 2. Constantes épinglées + faits d'orientation
### 2.1 Adresses [vérifiées on-chain, 2026-09-19]
- **AaveOracle** = `0x54586bE62E3c3580375aE3723C145253060Ca0C2`. **Vérifiée par le registre on-chain** :
  `PoolAddressesProvider(0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e).getPriceOracle()` → `0x54586be6…ca0c2`.
  **Le texte de la mission écrit `…060Ca40C` — c'est une COQUILLE** : `eth_getCode(…Ca40C)` = `0x` (0 octet ; aucun
  contrat), `eth_getCode(…Ca0C2)` = 3405 octets. Défaut du texte de mission consigné, adresse corrigée par la source
  autoritaire (le registre).
- WETH `0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2` ; sUSDe `0x9D39A5DE30e57443BfF2A8307A4256c8797A3497` ;
  USDe `0x4c9EDD5852cd905f086C759E8383e09bff1E68B3` ; wstETH `0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0` ;
  weETH `0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee` ; rsETH `0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7`.
- **Sources d'oracle (getSourceOfAsset, first-hand) — endpoints de la bissection** :
  sUSDe `0xb37ae8ab…` (desc `"Capped sUSDe / USDe / USD"`, @21895693) → `0x42bc86f2…` (desc `"Capped sUSDe / USDT / USD"`, @23545087) ;
  USDe `0x55b6c4d3…` (`"Capped USDe / USD"`) → `0xc26d4a1c…` (`"Capped USDT/USD"`).

### 2.2 Sélecteurs (keccak-256 self-testé, jamais codés en dur)
`getAssetPrice(address)=0xb3596f07` · `getSourceOfAsset(address)=0x92bf2be0` · `description()=0x7284e416` ·
`getPriceOracle()=0xfca513a8` · `aggregator()=0x245a7bfc` · `latestAnswer()=0x50d25bcd` ·
`AssetSourceUpdated(address,address)` topic0 (à recomputer) · `AnswerUpdated(int256,uint256,uint256)` topic0 = `0x0559884f…`.

### 2.3 Fait d'orientation — la source WETH d'Aave est un feed RETARDÉ (change la conception de la mesure 2)
`getSourceOfAsset(WETH)` est **constant** sur toute la fenêtre = `0x5424384b256154046e9667ddfaaa5e550145215e`
(desc `"ETH / USD"`), `aggregator()`=`0x7c7fdfca295a787ded12bb5c1a49a8d2cc20e3f8`, `phaseId=2` (constants, vérifiés).
`getAssetPrice(WETH)` = `0x5424384b.latestAnswer`. **Mesure quorum-2** au bloc 23549949 : la source Aave rend
`3703.47` (round agg 9338, `updatedAt` 21:14:24Z) alors que son propre aggregator `0x7c7fdfca` rend déjà `3772.36`
(round 9339, 21:15:24Z) : **la source lue par Aave RETARDE l'aggregator d'~1 round (~60 s)** pendant le krach
(agg 9337=3746.49@21:13:24Z, 9338=3703.47@21:14:24Z, 9339=3772.36@21:15:24Z ; la source montre round N−1).
**Conséquence de conception** : le prix que la liquidation lit au bloc `b` n'est **pas** posé par une transaction du
bloc `b` (la source n'émet aucun log ; passthrough retardé, pilotée par hauteur/temps). Le discriminant « ordre
intra-bloc (txIndex de la mise à jour vs txIndex de la liquidation) » suggéré par l'advisor **n'est pas défini** pour
cette source ; il est **remplacé** par la mesure Δ sur `getAssetPrice` (le prix réellement utilisé pour le HF) + un
**auto-test** d'appariement événement→prix qui documente le retard (règle §3.2). `getAssetPrice` reste la vérité-terrain
du HF, donc la mesure 2 cœur est intacte.

### 2.4 Fenêtre, cluster, seeds
Fenêtre `[LO,HI]=[23543616,23557920]`. Cluster WETH : **268** `LiquidationCall`, **119** blocs distincts (premier
23545088, dernier 23557060), Σ saisi **6914,83 WETH** (à recomputer depuis A-rawlogs). Heure de krach = **2025-10-10T21:00Z**
(`startTime`=**1760130000000** ms ; auto-test : `1760054400 % 86400 = 0` ⇒ minuit UTC, +75600 s). IC95-bas de M-2
(lead-lag `b`, bootstrap bloc-mobile) : **marché −5.1224071164199977e-5**, **oracle −9.366191053782448e-5**. Seed
**20251010** (mulberry32). Bloc « now » épinglé **26009084** (aucun `latest` dans un JSON haché).

## 3. Pré-enregistrement — hypothèses et règles de décision (AVANT mesure)

### 3.1 M-2b.1 — part de l'heure 21:00Z
**H1.** La part du volume liquidé WETH d'Aave dans le volume spot Binance de la MÊME heure reste faible (bascule
advisor-bis : **> ~5 %** rouvrirait un Λ intra-heure ; ≤ 5 % le referme). **Mesure.** `ratio = Q_21:00Z / V`, où
`Q_21:00Z` = Σ WETH liquidés (`liquidatedCollateralAmount/1e18`) des events dont le **ts de bloc** ∈ [21:00,22:00Z)
(recomputé depuis A-rawlogs + `eth_getBlockByNumber`, PAS depuis `hourly`), et `V` = volume base (ETH) de la kline 1 h
Binance `ETHUSDT` `startTime=1760130000000&interval=1h&limit=1` (champ [5]). **Auto-test** : `V` doit égaler la Σ des
60 klines 1 min de l'heure (tolérance flottante) ; sinon indiquer le champ retenu et la doc. **Borne haute honnête** =
`IC95_bas(M-2) × Q`, en log et en % (`exp(log)−1`), rendue pour **Q = Q_hour** (demandé) **ET** `Q = Q_max_bucket`
(le `b` de M-2 est **par bucket 15 min** ; l'appliquer à un Q horaire est une borne délibérément pessimiste, signalée),
avec la répartition de Q sur les 4 buckets de l'heure. Rapporté pour les deux feeds (marché, oracle).

### 3.2 M-2b.2 — test intra-bloc « mise à jour d'oracle au bloc de liquidation »
**Structure nulle pré-enregistrée (advisor).** `getAssetPrice@b` = état **post-bloc** ; `Δ = P@b − P@(b−1)` = variation
de la source Aave *dans* le bloc b. Sous « oracle d'abord, liquidation ensuite » (les bots liquident dès que la source
a baissé), on **attend** `Δ<0` sur-représenté aux blocs de liquidation — c'est le motif **conséquence** (prix→liquidation),
**pas** un canal prix-endogène. De plus (§2.3) la source retarde l'aggregator : `Δ` reflète un feed retardé, pas une
vente du bloc b.
**Mesures.** Pour les **119 blocs de liquidation** : `Δ=P@b−P@(b−1)` (comparaison d'octets pour « égal » exact + Δ en $
et en %). Deux témoins, tous deux pré-enregistrés (l'uniforme seul est confondu : la fréquence de transmission Chainlink
suit la volatilité, concentrée à 21:00Z) :
- **uniforme** : 119 blocs seedés dans `[LO,HI]` sans **aucune** `LiquidationCall` (tout collatéral) ;
- **apparié** : pour chaque bloc de liq, un bloc non-liq seedé dans `[b−50,b+50]`.
Rapporter **séparément** `P(Δ≠0)` (la source a-t-elle bougé) et `P(Δ<0 | Δ≠0)` (sens sachant qu'elle a bougé), pour liq
et les deux témoins. Tests seedés (seed 20251010) : **binomial exact** (parmi Δ≠0 aux blocs de liq : baisses vs hausses,
H0 p=0,5) et **permutation** (10000 tirages) de `P(Δ<0|liq) − P(Δ<0|apparié)` et de `P(Δ≠0|liq) − P(Δ≠0|apparié)`.
**Auto-test d'ordre (documentaire)** : pour les blocs à `Δ≠0`, chercher un `AnswerUpdated` (agg `0x7c7fdfca`) dont
`current == P@b` ; compter le taux d'appariement — attendu **faible** (le retard §2.3), ce qui **justifie** l'« indéterminé »
de l'ordre intra-bloc.
**Règle de décision — « mise à jour d'oracle négative systématique au bloc de liquidation : oui / non / indéterminé »** :
- **oui** : `P(Δ<0|liq)` **> témoin apparié** avec permutation `p<0,05` **et** baisses ≫ hausses (binomial `p<0,05`) ;
- **non** : pas de différence significative vs **témoin apparié** (`p≥0,05`) ;
- **indéterminé** : trop peu de Δ≠0 aux blocs de liq (< 10, sous-puissance). L'**ordre** intra-bloc (txIndex) est déclaré
  **indéterminé/non défini** d'office (§2.3), séparément de la conclusion Δ ci-dessus. Interprétation obligatoire jointe :
  un « oui » = motif conséquence (prix→liquidation), jamais un canal endogène.

### 3.3 M-2b.3 — bootstrap bloc-mobile de M-2 : dépendance au bucket de krach
**H3.** Le lead-lag de M-2 (IC95 ∋ 0, point-estimé positif) dépend du **bucket de Q maximal** (« bucket du krach »).
**Mesure.** Rejouer **exactement** le bootstrap bloc-mobile de M-2 (mêmes lignes lead-lag reconstruites — oracle dense
aux 159 fins-de-bucket + marché 1 min ; seed 20251010, BLOCK_LEN=4, 2000 réplicats). **Verrou de fidélité (pré-enregistré)** :
avant tout étiquetage, `b_Q` et l'IC95 `[lo,hi]` reproduits doivent égaler `m2-results.json` **à la dernière décimale**
(marché `b=1.2431941728499656e-5`, `lo=−5.1224071164199977e-5` ; oracle `b=1.0787426962049334e-5`,
`lo=−9.366191053782448e-5`) ; sinon **arrêt** (le bootstrap n'est pas le même) et recherche. Bucket de krach = ligne de
**Q max** (buckets 15 min **non alignés UTC**, t0=04:56:47Z) ; rapporter aussi les buckets chevauchant [21:00,22:00Z).
Par réplicat, tracer si l'indice de la ligne de krach est tiré. **Rendus** : fraction des 2000 réplicats **contenant** le
bucket de krach ; IC95 de `b` **séparés** pour les réplicats **avec** vs **sans**. Réplicats dégénérés (tous Q=0 ⇒ X
singulier ⇒ β=NaN) : **exclus et comptés** (règle pré-enregistrée). Fait pour les deux feeds.

### 3.4 Bissection de la source d'oracle (fait structurel de l'advisor)
**H4.** Entre 21895693 (2025-02-21, source USDe/USD) et 23545087 (2025-10-10, source USDT/USD) il existe **un** bloc de
bascule par actif où `getSourceOfAsset` passe de l'ancienne source (exacte) à la nouvelle (exacte). **Mesure.** Bissection
sur le prédicat `getSourceOfAsset(asset) == nouvelle_source` (adresse exacte, pas la description), séparément pour sUSDe
et USDe (même bloc ou non = un résultat). Au bloc de bascule `N` : **quorum-2** sur `getSourceOfAsset` à `N−1` (= ancienne
exacte) et `N` (= nouvelle exacte) — s'il apparaît une **3ᵉ** adresse intermédiaire, le signaler (non-monotone) ;
`description()` des deux ; **date UTC** de `N` (`eth_getBlockByNumber`). **Gouvernance, chemin on-chain d'abord** :
`eth_getLogs` au bloc `N`, `address=AaveOracle`, topic `AssetSourceUpdated(address,address)` → `txHash` → receipt →
émetteur/`PayloadsController`/`payloadId` ; puis forum Aave / app.aave.com par **id + date** ([lu] si la page se lit ;
titre jamais deviné). **LST/LRT** (wstETH/weETH/rsETH) : source actuelle confirmée @BLOCK_NOW=26009084
(`"Capped … / …(ETH) / USD"`) ; changement depuis 2025-01 testé en comparant `getSourceOfAsset` à un bloc de ts vérifié
≈2025-01 (trouvé par bissection sur ts, `eth_getBlockByNumber`, **pas** 7150 blocs/jour) ; `0x0` = actif non listé alors
(= résultat).

<!-- PREREG-END : le sha256 du fichier jusqu'à CETTE ligne incluse = prereg_sha256 (out/prereg.sha256.txt), calculé AVANT toute mesure. Reproduction : sed -n '1,/PREREG-END/p' MESURES-M2b-sources-2026-09-19.md | sha256sum -->
