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

## 4. Résultats (mesurés APRÈS le hachage §PREREG ; prereg_sha256 = `c0fc6ce2e283995444b031276c99e91f468572f239110612eb65a10d8acfaaf3`)

### 4.1 M-2b.1 — part de l'heure 21:00Z (`out/m2b1-hour-share.json` sha `e4f3d84731797918ef7684baff080a74e373478fde19a7be6e47722912a85e58`)
- **Q_21:00Z = 6109,57 WETH** (recomputé depuis A-rawlogs + ts de bloc, PAS depuis `hourly` : 140 events, 48 blocs).
  Répartition sur les 4 sous-buckets 15 min UTC : **21:00=1025,4 · 21:15=5075,1 (max) · 21:30=9,1 · 21:45=0,0**.
- **Volume Binance ETHUSDT de l'heure = 401 305,98 ETH** (base). URL épinglée
  `api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1h&startTime=1760130000000&limit=1` ; sha du body
  `4d673e95066ad537…` ; `openTime==1760130000000` (auto-test OK). **Recoupe exact** avec la Σ des 60 klines 1 min
  (401 305,98 ; écart < 1e-6).
- **Ratio = 6109,57 / 401 305,98 = 1,5224 %** du volume spot de l'heure. **Sous la bascule 5 %** (ne rouvre pas un Λ
  intra-heure). *(Rappel M-2 : 0,318 % sur toute la fenêtre ; 1,52 % est la seule heure la pire, toujours < 5 %.)*
- **Borne haute honnête** = IC95-bas(M-2 lead-lag `b`, par bucket 15 min) × Q, en log et % (`exp−1`) :

  | feed | × Q_heure (6109,57) | × Q_max_bucket (5075,15) |
  |---|---|---|
  | marché (`b_lo=−5,1224e-5`) | **−0,3130 log = −26,87 %** | −0,2600 log = −22,89 % |
  | oracle (`b_lo=−9,3662e-5`) | **−0,5722 log = −43,57 %** | −0,4753 log = −37,83 % |

  **Caveat obligatoire** : le point-estimé de `b` (M-2) est **positif** ; cette borne applique le **bord bas** de l'IC
  (délibérément pessimiste) et un `b` **par bucket 15 min** à un Q **horaire** — c'est une borne, **pas un effet détecté**.

### 4.2 M-2b.2 — test intra-bloc (`out/m2b2-intrablock.json` sha `856fd8cad933ca840daeb96fcd44c59650b96fc9da665311564e630b5e60c8fc`)
Δ = `getAssetPrice(WETH)@b − @(b−1)` (source Aave `0x5424384b`, le prix du HF). « Égal » = octets identiques.

| ensemble | n | baisse | égal | hausse | P(Δ≠0) | P(Δ<0 \| Δ≠0) | Δ$ médian (Δ≠0) |
|---|---|---|---|---|---|---|---|
| **liquidation** | 119 | **33** | 84 | 2 | **0,294** | **0,943** | −24,48 (min −162,19 / max +68,89) |
| témoin **uniforme** | 119 | 0 | 119 | 0 | **0,000** | — | — |
| témoin **apparié** (±50) | 119 | 0 | 115 | 4 | 0,034 | 0,000 | — |

- **Binomial exact** (baisses vs hausses aux blocs de liq, H0 p=0,5) : 33 vs 2, **p = 3,67e-8**.
- **Permutation** (10000, seed 20251010) liq vs apparié : `P(Δ≠0)` diff **+0,261** (p≈0) ; `P(Δ<0)` diff **+0,277** (p≈0) ;
  `P(Δ<0|Δ≠0)` diff **+0,943** (p≈0, nA=35, nB=4). Le témoin **uniforme** confirme le risque de confusion signalé
  (fréquence de transmission Chainlink ~nulle hors volatilité : 0/119) — d'où le double témoin pré-enregistré.
- **Auto-test d'ordre** : sur 35 blocs de liq à Δ≠0 — **ordre mesurable dans 15/35** : un `AnswerUpdated` (agg
  `0x7c7fdfca`) a `current==P@b` et **précède la transaction de liquidation 15/15** (`txIndex` update < liq) ;
  **non mesurable dans 17/35** (aucun `AnswerUpdated` in-bloc apparié) ; 0 multi-log. Mécanisme **établi et sourcé** en
  **§4.6** (feed **SVR** backrun-only) — remplace la formulation « retard » du §2.3.
- **Conclusion (règle §3.2) : OUI au sens de la règle** — mise à jour d'oracle négative au bloc de liquidation,
  **présente dans 29 % des blocs de liq (33/119)** et **négative dans 94 %** de ces cas (33/35) : baisse ≫ hausse
  (binomial p=3,7e-8) et P(Δ<0|liq) ≫ témoin apparié (permutation p≈0). « Systématique » = **dominance statistique nette**,
  pas 100 % des blocs. **Interprétation imposée** : c'est le **motif conséquence** (baisse d'oracle → liquidation ;
  l'update précède la liq **15/15** quand il est in-bloc), **pas** un canal prix-endogène. Le prix lu est le feed
  **SVR backrun-only** (§4.6) : il ne peut pas frontrun/sandwich, donc n'incorpore pas une vente du même bloc.

### 4.3 M-2b.3 — bootstrap bloc-mobile, dépendance au bucket de krach (`out/m2b3-bootstrap-crash.json` sha `cf084e88fa48134f1db17fa9951c31969ed52534ebc193e6e9ade147d355a79b`)
- **Verrou de fidélité : RÉUSSI** — `b`, IC95 `[lo,hi]` reproduits **à la dernière décimale** vs `m2-results.json`
  (marché `b=1.2431941728499656e-5`, `lo=−5.1224071164199977e-5`, `hi=2.0502223129203922e-4` ; oracle
  `b=1.0787426962049334e-5`, `lo=−9.366191053782448e-5`, `hi=1.2284671938795567e-4`). Le bootstrap étiqueté EST celui de M-2.
- **Bucket de krach** = ligne de Q max = **kbucket 65**, fin **2025-10-10T21:26:47Z**, **Q=5982,8 WETH**.
- **Fraction des 2000 réplicats contenant le bucket de krach = 62,90 %.** Réplicats dégénérés (Q≡0 ⇒ β NaN) : **0**.

  | feed | IC95 **AVEC** krach (reps) | IC95 **SANS** krach (reps) |
  |---|---|---|
  | marché | **[+8,74e-6 ; +2,35e-5]** (1258) — **positif** | [−7,65e-5 ; +4,47e-4] (742) — ∋ 0 |
  | oracle | **[+6,95e-6 ; +1,95e-5]** (1258) — **positif** | [−2,01e-4 ; +2,10e-4] (742) — ∋ 0 |

- **Lecture** : l'IC95 global (∋ 0) est un **mélange** — les réplicats qui contiennent le bucket de krach donnent une
  pente **positive et bornée loin de 0** (le rebond en V, signe **opposé** à H_Λ<0) ; ceux qui l'excluent ne sont que du
  bruit autour de 0. La pente apparente est **entièrement portée par l'unique bucket de plus gros volume**, et ce bucket
  la pousse **vers le haut**, pas vers le bas. Renforce le « indéterminé / pas d'évidence de Λ<0 » de M-2.

### 4.4 Bissection de source + gouvernance + LST/LRT (`out/m2b4-source-bisect.json` sha `89719a0fc01cb1f917c7ca551a3b4f9893456d1ab8fe9212c291f1b3c3dcb19b`)
**Adresse AaveOracle** confirmée on-chain via `PoolAddressesProvider.getPriceOracle()` = `0x54586bE6…Ca0C2`
(le `…Ca40C` du texte de mission = coquille, 0 octet de code).
**Bloc de bascule = 22002625, 2025-03-08T14:01:47Z — MÊME bloc pour sUSDe ET USDe**, transition **unique et contiguë**
(`lastOLD=22002624`, `firstNEW=22002625`), **quorum-2** aux deux bornes :
- sUSDe : `0xb37ae8ab…` `"Capped sUSDe / USDe / USD"` → `0x42bc86f2…` `"Capped sUSDe / USDT / USD"` ;
- USDe : `0x55b6c4d3…` `"Capped USDe / USD"` → `0xc26d4a1c…` `"Capped USDT/USD"`.
Les deux dans **la même transaction** `0xbb810541258db350d632e9a22ed7d7547509c67b2585dbc7a64a76b6ac8e42e0`
(`to`=`0x6593c7de…` PayloadsController/exécuteur, 20527 o de code ; `from`=`0x31db4c23…` ; 8 logs ; AaveOracle parmi
les émetteurs), topic `AssetSourceUpdated(address,address)`.
**Gouvernance Aave [lu first-hand, governance.aave.com/t/…/20495]** : **« [ARFC] sUSDe and USDe Price Feed Update »**,
co-auteurs **Chaos Labs + LlamaRisk**, posté **2025-01-02 21:05** ; **vote Snapshot 2025-02-03→06, adopté (645,6k)** ;
id Snapshot `0xd09ac857…` ; AIP via GitHub PR #621 ; **payloadId on-chain = 254** [lu, log `PayloadExecuted(uint40)`
émis par le PayloadsController `0xdabad81a…` dans la tx de bascule] ; `proposalId=262` = référence app.aave.com [2nd].
**Mécanisme** : remplacer le feed **secondaire de marché USDe/USD par USDT/USD** ; pour sUSDe = taux
sUSDe/USDe × peg 1:1 USDe/USDT × Chainlink USDT/USD. **Rationale chiffrée [lu]** : une déviation USDe de **5 %** rendrait
**~300 M$** de positions **éligibles** à la liquidation, la liquidité ne couvrant que **6 M$ à 4 % d'impact** ; un dépeg
de **2,5 %** rendrait **~263 M** sUSDe liquidables. **Exécution on-chain (ma mesure) : 2025-03-08.**
**Conséquence structurelle datée** : **avant** 2025-03-08 (donc à l'événement sUSDe du **2025-02-21**) la source était
**USDe/USD de marché** → une décote USDe réelle atteignait le HF (M-2 : oracle sUSDe −2,21 %, USDe −2,23 %). **À partir
du 2025-03-08** la source est USDT/USD : une vente USDe/sUSDe (Curve) n'entre plus dans le HF de ces clusters (le prix
= taux contractuel plafonné × USDT/USD).
**LST/LRT** (source @BLOCK_NOW=26009084 vs @21626161 = 2025-01-14T23:59:59Z) : **descriptions inchangées** depuis
2025-01, seule l'**adresse d'adaptateur** a été redéployée (dénomination **ETH** conservée, jamais un feed USD de marché) :

| actif | source 2025-01-14 | source now | description (inchangée) |
|---|---|---|---|
| wstETH | `0xb4ab0c94…` | `0xe1d97bf6…` | `"Capped wstETH / stETH(ETH) / USD"` |
| weETH | `0xf112af6f…` | `0x87625393…` | `"Capped weETH / eETH(ETH) / USD"` |
| rsETH | `0x47f52b2e…` | `0x7292c95a…` | `"Capped rsETH / ETH / USD"` |

rsETH **listé** dès 2025-01 (source ≠ 0x0). Le canal endogène atteignant le HF de ces clusters reste **ETH/USD** (celui
mesuré nul par M-2), pas un feed du collatéral lui-même.

### 4.5 Provenance / reproductibilité
- **Modèle** `claude-opus-4-8[1m]` (R-1), effort max · 2026-09-19 · **aucun commit, aucun workflow (R-20)** · hors dépôt.
- **Scripts** (Node ESM v24, `import` file://, sélecteurs via keccak self-testé, seeds/blocs épinglés) + sha256 :
  `lib-m2b.mjs` `faa56668…` · `m2b1-hour-share.mjs` `844d1b90…` · `m2b2-intrablock.mjs` `12e93113…` ·
  `m2b3-bootstrap-crash.mjs` `1f9ec803…` · `m2b4-source-bisect.mjs` `ae0a0d0b…`.
- **Sorties** : les 4 JSON ci-dessus ; **aucun horodatage dans le JSON haché** (started/finished dans `out/*.timing.txt`),
  donc **sha reproductibles** — **démontré** : re-exécution de `m2b1-hour-share.mjs` ⇒ sha **identique** `e4f3d847…`
  (déterministes sur données on-chain + klines historiques + seed ; correctif de la dette M-2 « horodatage dans le JSON »).
  Fournisseurs keyless drpc/mevblocker/blastapi/nodies, **quorum-2** pour les lectures de prix (M-2b.2) et les bornes de
  bissection (M-2b.4).
- **Entrées** : `A-rawlogs.jsonl` `d0f4aa1e…` ; `m2-results.json` `4e4f64a1…`.
- **Contrôle mots-interdits** : **0 emploi** du terme d'emballement prohibé ni de « aurait » (conditionnel spéculatif)
  dans les résultats, scripts, et le rapport ; les uniques apparitions littérales de ces deux tokens sont les **phrases
  d'interdiction** en §0 (mentions méta, non emplois) — signalé pour qu'un `grep` du réviseur soit expliqué.
- **Dettes : zéro.** Aucun point ouvert. Le mécanisme de la source WETH `0x5424384b` est **établi et sourcé** en §4.6
  (feed Chainlink **SVR**, backrun-only) — l'ancienne formulation « retard » du §2.3 (prereg gelé) y est corrigée par des
  sources ([lu] on-chain + [lu] communiqué). Item de commodité (non bloquant) : lecture du **code** du contrat SVR [abs].

### 4.6 Correction sourcée du §2.3 — la source WETH d'Aave est le feed Chainlink SVR (backrun-only)
La formulation « passthrough retardé, piloté par hauteur/temps » du §2.3 (pré-enregistrement **gelé**, non modifié) est
**imprécise** ; le mécanisme réel est **établi et sourcé** (donc **pas** retiré comme non-sourcé) :
- **On-chain [lu]** : `getSourceOfAsset(WETH)` valait le **proxy Chainlink brut `0x5f4eC3Df…`** jusqu'au **bloc 22803459
  (2025-06-28T14:12:59Z)**, où il est passé à `0x5424384b…` (`AssetSourceUpdated(WETH)`, tx `0x1da81a2a…`, exécutée par
  le PayloadsController Aave). C'est un **changement de source par gouvernance**, pas un retard passif.
- **Communiqué [lu, prnewswire 2025-03-28]** : Aave a intégré **Chainlink SVR (Smart Value Recapture)** sur Ethereum
  Mainnet, « built specifically for **backrunning liquidations**, and therefore **cannot be used for frontrunning or
  sandwich attacks** » (marchés initiaux tBTC/LBTC/AAVE/LINK ; construit avec BGD Labs + Flashbots + MEV-Share). WETH a
  été ajouté ensuite (bloc 22803459, ma mesure on-chain).
- **Réconciliation mesure↔mécanisme** : le SVR recapture l'OEV en faisant **backrunner la mise à jour d'oracle par la
  liquidation** dans le même bloc. C'est **exactement** le motif mesuré en §4.2 (**15/15** : la mise à jour in-bloc
  **précède** la liquidation) et l'« écart » observé au §2.3 vs l'aggregator brut `0x7c7fdfca` : le feed SVR ne se règle
  que via les bundles de backrun, pas à chaque round brut (~60 s) — d'où l'apparence de retard. Étant **backrun-only**, il
  **ne peut pas** incorporer une vente DEX du même bloc.
- **Portée** : ceci **ne change aucun des trois verdicts** (`getAssetPrice` reste le prix du HF quelle que soit la
  plomberie). La mesure 2 « oui = conséquence » est **renforcée** : par conception SVR, le prix qui déclenche la
  liquidation est mis à jour **juste avant** la liquidation qui le backrun.
- **Niveaux** : adoption datée + comportement backrun-only = **[lu]** (trace on-chain + communiqué) ; lecture du **code**
  des contrats SVR `0x5424384b` / `0x7c7fdfca` = **[abs]** (non requise ; item de commodité non bloquant).
