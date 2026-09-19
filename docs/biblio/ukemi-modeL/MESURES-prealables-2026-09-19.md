# Mesures préalables — programme « Ukemi » (M-1 coût archive keyless, M-2 impact prix Λ)

**Provenance.** Worker `claude-opus-4-8[1m]` (résolu tel quel, R-1), effort max · date 2026-09-19 ·
mission « mesure préalable » (MONARK/Ukemi) · dépôt courant de session = `F:\Shogen` mais **aucune écriture
dans un dépôt** (sorties sous `F:\Monark\docs\biblio\ukemi-modeL\`) · réviseur = orchestrateur (vérif
adversariale R-21) · **aucun commit, aucun workflow (R-20)**. Advisor-DeFi consulté 2026-09-19 (avis intégré,
conseil non-verdict). `memstack` **injoignable cette session** (ConnectionRefused) — non bloquant ici, consigné.

Ce document est **pré-enregistré** : §2 (constantes), §3 (hypothèses + règles de décision M-1) et §4 (idem M-2)
sont écrits **AVANT** toute mesure ; les résultats sont en §5–§6, ajoutés au fil de l'eau. Interdits tenus :
aucun « aurait alerté », aucun score, aucune extrapolation hors fenêtre, aucun « cascade » sans le chiffre Λ.

---

## 1. Entrées (immuables, sha256)

| Entrée | Rôle | sha256 / valeur |
|---|---|---|
| `docs/census-2026-09-18/data/A-rawlogs.jsonl` | 26036 `LiquidationCall` (tout collatéral) | `d0f4aa1e23a3eaed6375dca4e6564b7123dfc9ed9b303c1cb7de84dbdae1a996` (recomputé 2026-09-19, = census) |
| `fixtures/usde-calib-series.json` | fenêtres jour↔bloc UTC | `7c33027a0e4c6a72e6b390dd95aa2396f1f8c6cdcfee22f8abe729ba8dfc9ef1` (census) |
| bgd-labs/aave-address-book `src/AaveV3Ethereum.sol` (main) | adresses Aave v3 [lu] | fetch 2026-09-19 ; 2/4 constantes recoupent le census |

**Adresses Aave v3 Ethereum [lu]** (bgd-labs address-book, main, 2026-09-19 ; ✓ = recoupe census A) :
- `POOL` = `0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2` ✓
- `POOL_ADDRESSES_PROVIDER` = `0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e` ✓
- `ORACLE` (AaveOracle) = `0x54586bE62E3c3580375aE3723C145253060Ca0C2` ✓
- `UI_POOL_DATA_PROVIDER` = `0x2dAd8162A989cd99D673dE4425Bb2298Db1E1aA2` (courant ; **code@B à vérifier** — redéployé aux upgrades)

---

## 2. Constantes épinglées

- **Fenêtre événement 2025-10-10/11 UTC** = blocs **[23543616, 23557920]** (windows.ts, fixture-pinné :
  2025-10-10 = [23543616, 23550763], 2025-10-11 = [23550764, 23557920]).
- **Bloc archive B = 23545087** = (premier `LiquidationCall` collatéral WETH de la fenêtre, bloc 23545088, logIndex 307) − 1.
  **Justification** : état **immédiatement pré-cascade** du cluster WETH ; profondeur ~2,46 M blocs sous finalized
  26005649 (≫ fenêtre d'état récent ~128 blocs) donc exige un nœud **archive** véritable.
- **Cluster WETH** (collatéral `0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2`) : **268** `LiquidationCall`, **213** users
  distincts, blocs 23545088→23557060. Réplication : **LINK** (`0x514910…`, 145 events / 127 users).
- **Événement entier** (tout collatéral, fenêtre) : 902 liq, **623** users distincts, 27 actifs de collatéral.
- **sUSDe 2025-02-21** (`0x9d39a5…`) : 5 liq, blocs {21895671, 21895693} — **temporellement dégénéré (2 blocs)**.
- **Sondes archive M-1** (3 users WETH liquidés tard, existaient à B) : `0x552c4ad0849ab72c5b5ca4f30d216c8a654c07b4`,
  `0xe0c20053d20c8d6d6de243af2093b222eb3e9c03`, `0x00dbcc59e6bb596cf2a1cff9326c5f80618875c3`.
- **Seed bootstrap** = `20251010` (PRNG mulberry32 déterministe, jamais `Math.random`).
- **Fournisseurs testés (keyless)** : publicnode, llamarpc, drpc, ankr, 1rpc, tenderly(.co ×2 alias), mevblocker,
  blastapi, blxrbdn, nodies. `providerOf` = domaine enregistrable (alias d'un opérateur = 1 fournisseur).

---

## 3. M-1 — pré-enregistrement (coût/faisabilité `eth_call` archive keyless)

**Objet.** Reconstruire le « book » du cluster liquidé à un bloc archive B via `Pool.getUserAccountData(user)`
(agrégats HF, base USD 8 déc.) et `UiPoolDataProvider.getUserReservesData(provider, user)` (positions par actif,
1 appel/user). Mesurer, par fournisseur keyless : archive OK ?, latence (ms/appel médiane + p90), cap (appels
avant refus soutenu).

**H_M1 (faisabilité)** : « il existe ≥ 1 fournisseur keyless servant l'archive `eth_call` à B à une cadence
utile (≥ ~30 appels/min soutenus) permettant de reconstruire un cluster de N comptes en < ~30 min. »

**Trois issues par fournisseur** (règle de classement, pré-enregistrée) :
1. **archive OK** = `getUserAccountData(user)@B` renvoie sans erreur, `totalDebt(B) > 0` pour un user liquidé,
   **ET** octets(B) ≠ octets(latest) pour ce user, **ET** quorum-2 : deux fournisseurs renvoient des octets
   **identiques** à B.
2. **latest silencieux** = renvoie sans erreur mais octets(B) == octets(latest) pour un user liquidé (tag bloc
   ignoré → pas d'archive, même sans message d'erreur). **Rejeté** de l'archive.
3. **refus** = erreur (auth/token, rate-limit/429, méthode absente, plage). Classée via `isAuthDead`/`isRateLimit`
   du census.

**Cap** : bornes de politesse **déclarées** — ≤ 100 appels séquentiels/fournisseur, concurrence 1, arrêt au 1ᵉʳ
429/rate-limit **soutenu** (2 refus consécutifs) ; compteur exact d'appels tirés consigné. Latence = médiane + p90
sur ≥ 10 sondes réussies.

**Extrapolation (pré-enregistrée)** : appels pour reconstruire le book = **N** (`getUserReservesData`, 1/user)
`+ 2` (`getReservesData()` global + `getAssetsPrices(assets)` batch, prix oracle du book). Deux N rapportés :
**N=623** (événement entier) et **N=213** (cluster WETH). Temps = N / (cadence soutenue du meilleur fournisseur).
**Caveat une ligne** : le cluster *à risque* qu'un recorder réel (U-1) doit reconstruire n'est PAS énumérable
depuis `LiquidationCall` (il faut les détenteurs d'aWETH via Transfer logs) — N sous-estime le coût réel d'U-1.

**Règle de décision M-1** : « reconstruction de N comptes à B = X appels, Y min, fournisseur Z » si H_M1 tenue ;
sinon **« infaisable keyless »** → prix public d'un plan archive Alchemy/QuickNode/Infura [lu] (page tarifaire, date).

---

## 4. M-2 — pré-enregistrement (impact prix Λ ≠ 0 ?)

**H_Λ** : « le prix du collatéral baisse d'autant plus que le volume liquidé cumulé est grand, dans la fenêtre ».
Cluster = **WETH** (seul n suffisant ; répond à “Λ existe-t-il sur Aave 10-10/11 ?”). Réplication LINK si budget RPC.
Cluster-cible Ukemi (USDe/sUSDe) sur 10-10/11 = **n=2 → indéterminé par manque de données, PAS Λ=0**. sUSDe
2025-02-21 (n=5, 2 blocs) = **forme brute seulement, zéro régression**.

**Q** = WETH saisi par liquidation = `liquidatedCollateralAmount / 1e18` (unité de l'actif vendu ; Λ est **par unité
vendue**, jamais en USD). **P** = deux feeds, déclarés :
- **Oracle (feed porteur de la thèse)** : `AaveOracle.getAssetPrice(WETH)@bloc` (8 déc. USD) — c'est le prix qui
  entre dans le HF, donc le P(Q) du modèle. Chemin d'oracle = Chainlink ETH/USD ; son **seuil de déviation τ_dev**
  et heartbeat = **plancher de résolution** (tout Λ·Q sous τ_dev est invisible dans l'oracle par construction) —
  τ_dev lu [lu] en §6. Disponible seulement si M-1 rend l'archive faisable.
- **Marché témoin** : Binance `ETHUSDT` klines 1 min (API publique keyless [lu]) — donne aussi le volume global
  pour la phrase d'échelle.

**Ts de bloc** via `eth_getBlockByNumber` (non-archive, tout fournisseur) — **jamais** interpolé à 12 s.

**Tests (pré-enregistrés)** :
1. **Niveau** : `logP ~ Qcum`, `logP ~ t`, `logP ~ Qcum + t`. Rapporte β, R², et **r(Qcum, t)** (colinéarité).
2. **Lead-lag (test discriminant de causalité)** : buckets temporels fixes **15 min** (via ts de bloc) ;
   `ΔlogP_{t→t+1} = a + b·Q_t + c·ΔlogP_{t−1→t}`. Q_t = WETH liquidé Aave dans le bucket t. Rapporte n_buckets,
   n_nonzero (Q_t>0), b, IC.
3. **Échelle** : `Σ WETH liquidé Aave (fenêtre) / volume ETHUSDT Binance (fenêtre)` — rend l'« indéterminé » lisible.

**Bootstrap** : **par blocs mobiles** (résidus autocorrélés en série temporelle → pairs-bootstrap donne un IC trop
étroit) ; longueur de bloc rapportée ; PRNG mulberry32 seed `20251010` ; 2000 rééch. ; IC95 percentile.

**Règle de décision M-2 (écrite AVANT)** — conclusion en une phrase « Λ ≠ 0 : oui / non / indéterminé » :
- **oui** : b (lead-lag) < 0, IC95 bootstrap-bloc **excluant 0**, **et** b survit à l'ajout de `+ t`.
- **non** : IC95 **inclut 0** **et** |b·Q_typique| ≤ τ_dev (impact sous la résolution oracle).
- **indéterminé** : r(Qcum, t) > 0,95 (β non séparable) **ou** n_nonzero < 30 **ou** effet sous la résolution oracle.

---

## 5. Résultats M-1 — archive `eth_call` keyless FAISABLE et bon marché

Script : `scripts-mesure/m1-archive-cost.mjs` → `out/m1-results.json`
(sha256 `986cffd931a62d15c28c16105e42c674eb6055e92000fe737b64e1750d972130`) ;
`m1b-userconfig.mjs` → `out/m1b-userconfig.json`. Sélecteurs calculés en script (keccak self-testé) :
`getUserAccountData(address)=0xbf92857c`, `getUserReservesData(address,address)=0x51974cc0`,
`getUserConfiguration(address)=0x4417a583`, `getReservesList()=0xd1946dbc`.

**Preuve d'archive (quorum-2).** `getUserAccountData(user0)@B` renvoie des octets **identiques sur les 6 endpoints
archive-OK** (1 seule valeur distincte) : book de `0x552c4ad0…` à B = collatéral **18 038 $**, dette **14 218 $**,
**HF 1,0530** (position à levier pré-liquidation réelle, décodée base-8déc/1e18). Détection « latest silencieux » :
0/6 (aucun endpoint ne renvoie les mêmes octets à B et à `latest` pour un compte liquidé).

**Tableau fournisseur × (archive OK ?, ms/appel, cap).** 12 URLs / 10 opérateurs testés ; latence = médiane (p90)
sur sondes chaudes ; cap = burst ≤ 100 séquentiel, arrêt à 2 refus consécutifs.

| Opérateur | URL | Archive `eth_call`@B | ms/appel méd. (p90) | Cap mesuré | Note |
|---|---|---|---|---|---|
| drpc | eth.drpc.org | **OUI** | **94 (267)** | **≥100, cap NON atteint** (~558/min) | sert getLogs ET eth_call |
| mevblocker | rpc.mevblocker.io | **OUI** | 111 (352) | **≥100, cap NON atteint** (~508/min) | idem |
| blastapi | eth-mainnet.public.blastapi.io | **OUI** | 162 (183) | **≥100, cap NON atteint** (~373/min) | **eth_call archive OK** alors que getLogs gaté (census) |
| nodies | eth-pokt.nodies.app | **OUI** | 174 (266) | ≥100, cap NON atteint (~340/min) | idem |
| tenderly | gateway.tenderly.co / mainnet.gateway | **OUI** | 63–74 (67–80) | rate-limit **dès l'appel ~8–9** (~12–30 servis) | le + rapide mais **cap tôt** |
| publicnode | ethereum-rpc / ethereum.publicnode.com | non (auth) | — | — | 403 « Archive requests require a personal token » |
| ankr | rpc.ankr.com/eth | non (auth) | — | — | -32000 « must authenticate with an API key » |
| 1rpc | 1rpc.io/eth | **non (non-archive)** | — | — | -32000 « historical state … is not available » (élagué) |
| blxrbdn | eth.rpc.blxrbdn.com | **non (non-archive)** | — | — | idem (élagué) |
| llamarpc | eth.llamarpc.com | injoignable ici | — | — | `fetch failed` (comme census) |

**Résultat archive ≠ résultat getLogs.** `eth_call` archive keyless est **plus largement servi** que
`eth_getLogs` archive : blastapi et nodies (gatés/limités pour getLogs au census A §2) **servent** l'`eth_call`
archive à B. **5 opérateurs distincts** servent l'archive `eth_call` (drpc, mevblocker, blastapi, nodies, tenderly).

**Book par actif.** `UiPoolDataProvider` courant (`0x2dAd816…`, address-book) validé **à `latest`**
(réponse 8672 o, décode le tableau de réserves) mais **code ABSENT au bloc B** (redéployé après 2025-10-10 —
avertissement advisor confirmé, MESURÉ). Chemin **auto-suffisant sans adresse historique** (mesuré @B) :
`getUserConfiguration(user)@B` → chaque looper WETH sondé utilise **1–2 réserves** (1 collatéral + 0–1 dette ;
55 réserves listées à B) → **multiplicateur book-par-actif ≈ 2,7 appels/user** (1 `getUserConfiguration` +
~1,7 `balanceOf`), après un one-time global (1 `getReservesList` + ~55 `getReserveData` pour les adresses
aToken/debtToken). *(Alternative de commodité : adresse historique du `UiPoolDataProvider` déployée ≤ bloc B — item
de procurement formé, non requis pour la faisabilité.)*

**Extrapolation (règle §3).** Fournisseur **soutenu** retenu = **drpc** (≥100 sans refus, ~558 appels OK/min ;
⚠ tenderly plus rapide/appel mais rate-limite dès ~8 appels, **seul vrai cap trouvé**, donc écarté comme
fournisseur de volume). *Réconciliation artefact↔rapport* : le champ `extrapolation.best_provider` de
`m1-results.json` sélectionne par **débit de pointe** (`rate_ok_per_min` → tenderly, 0,3/0,8 min) ; le rapport
retient au contraire le fournisseur ayant **tenu ≥100/100** (drpc) — critères différents, **même donnée brute**.
*Borne* : l'extrapolation suppose la cadence **tenue au-delà** du burst mesuré (≤100 appels) ; non testé plus loin.

| Cible | Appels (book agrégat, `getUserAccountData`) | Temps @drpc | Book par actif (~×2,7) | Temps @drpc |
|---|---|---|---|---|
| **Cluster WETH (N=213)** | 213 + 2 = **215** | **~0,4 min** | 55 + 213×2,7 ≈ **630** | ~1,1 min |
| **Événement entier (N=623)** | 623 + 2 = **625** | **~1,1 min** | 55 + 623×2,7 ≈ **1737** | ~3,1 min |

Avec rotation quorum sur les 5 opérateurs archive-OK : débit et résilience supérieurs.

**Verdict M-1 : H_M1 TENUE — FAISABLE keyless.** « Reconstruire le book agrégat d'un cluster de N comptes au bloc
B = **N+2 appels `eth_call` archive, < ~1 min** (N=213 WETH → ~0,4 min ; N=623 événement → ~1,1 min), fournisseur
**drpc** (ou mevblocker/blastapi/nodies), quorum-2 vérifié. » Le book **par actif** ajoute un facteur ~2,7 (encore
minutes). Aucun plan payant n'est requis (donc pas de page tarifaire Alchemy/QuickNode à lire — déclencheur §3
non atteint). **Caveat U-1** (pré-enregistré) : N = comptes DÉJÀ liquidés dans les logs ; le cluster *à-risque*
qu'un recorder réel doit reconstruire (détenteurs d'aWETH via Transfer logs) est plus grand → N sous-estime U-1.

## 6. Résultats M-2 — impact prix Λ : **INDÉTERMINÉ** (aucune évidence causale ; échelle négligeable)

Script : `scripts-mesure/m2-lambda.mjs` → `out/m2-results.json`
(sha256 `4e4f64a100ebcb6d158b9bcca8b9ddd9e98761ebb0c6167584532405d00acba4`) ;
`m2b-susde-0221.mjs` → `out/m2b-susde-0221.json`
(sha256 `2ec19c78758eea8f677dd11d6efa28f2fb6299e4c62c7896c891b76768a9822b`).
`getAssetPrice(address)=0xb3596f07` (keccak). Prix oracle = `AaveOracle.getAssetPrice`@bloc (archive, M-1) ;
prix marché = Binance `ETHUSDT` klines 1 min (API publique keyless [lu], 2420 min). Q = WETH saisi
(`liquidatedCollateralAmount/1e18`). Ts de bloc via `eth_getBlockByNumber`.

**Setup mesuré (cluster WETH).** 268 events / 119 blocs / **Σ 6914,83 WETH** saisis. Fenêtre ts
**2025-10-10T04:56:47Z → 2025-10-11T21:06:59Z (40,2 h)**. Oracle WETH **4346,87 → 3662,39 $ (−15,75 %)**.

**Forme brute (WETH liquidé/heure vs prix) — le fait qui gouverne.** **88 % du WETH liquidé (6109,6 sur 6914,8)
tombe dans la SEULE heure 2025-10-10 21:00Z** (heure du crash marché-large) ; l'oracle y touche 3601 $ **puis
REBONDIT** (3601 → 3886 l'heure suivante → 3833) alors que les liquidations, elles, ont déjà eu lieu. Un rebond
en V juste après l'heure de liquidation maximale est **incompatible** avec un enfoncement du prix piloté par les
liquidations (Λ·Q auto-entretenu).

**Régressions de niveau `logP ~ …`** (n=268 events). **corr(Qcum, t) = 0,571** (séparables ; < 0,95).

| Feed | β(Qcum seul) | R² | β(t seul)/h | R² | β(Qcum \| t) | β(t \| Qcum) | R²(Qcum+t) |
|---|---|---|---|---|---|---|---|
| oracle | −1,18e-5 | 0,393 | −1,69e-3 | 0,072 | −1,32e-5 | +8,4e-4 | 0,405 |
| marché | −0,99e-5 | 0,297 | −1,69e-3 | 0,077 | −1,04e-5 | +3,0e-4 | 0,298 |

Association de niveau forte et négative (β<0, survit au contrôle temporel). **MAIS c'est la régression fallacieuse
attendue** : deux séries tendancielles sur un crash exogène commun ; Qcum est un meilleur proxy « d'avancement dans
le crash » que l'horloge (β_t bascule positif conditionnellement) → quasi-tautologique, **non causal**.

**Test lead-lag (discriminant de causalité inverse)** : `ΔlogP_{t→t+1} = a + b·Q_t + c·ΔlogP_{t−1→t}`,
buckets 15 min. **n_buckets=159, n_nonzero=29** (< 30, seuil pré-enregistré). Bootstrap **par blocs mobiles**
(bloc=4 buckets=1 h, 2000 rééch., mulberry32 seed 20251010).

| Feed | b (volume→baisse t+1) | IC95 bootstrap-bloc | b (contrôle +t) | IC95(+t) | signe attendu H_Λ |
|---|---|---|---|---|---|
| marché (Binance 1m) | **+1,24e-5** | **[−5,1e-5 ; +2,05e-4]** ∋ 0 | +1,25e-5 | [−5,0e-5 ; +2,11e-4] ∋ 0 | négatif → **contredit** (signe +) |
| oracle (dense, 161 blocs fin-bucket) | **+1,08e-5** | **[−9,37e-5 ; +1,23e-4]** ∋ 0 | +1,08e-5 | [−9,24e-5 ; +1,22e-4] ∋ 0 | négatif → **contredit** (signe +) |

Oracle échantillonné **densément aux 161 fins-de-bucket** (blocs estimés ~12,09 s/bloc, ts réel relu ; PAS
seulement les blocs de liquidation — sinon sous-échantillonnage entre màj Chainlink, correctif appliqué). **Les deux
feeds concordent** désormais : le volume liquidé en t **ne prédit pas** une baisse en t+1 — IC95 **inclut 0** ET
point-estimé **positif** (signe opposé à H_Λ). c_prevret (momentum) = +0,21 (marché) / +0,54 (oracle).

**Résolution oracle & magnitude.** τ_dev(ETH/USD Ethereum mainnet, proxy `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419`)
= **0,5 % de déviation, heartbeat 3600 s** ([lu] **first-hand**, `reference-data-directory.vercel.app/feeds-mainnet.json`,
champs `threshold`=0.5 / `heartbeat`=3600). L'effet lead-lag causal étant indistinct de 0, aucun mouvement d'oracle
n'est attribuable au volume liquidé ; et |b·Q_typique| ≤ 1,2e-5 × 11,73 WETH (Q horaire médian, borne haute)
≈ **0,014 % ≪ 0,5 %** → un impact de l'ordre mesuré **ne franchit pas** le seuil de màj de l'oracle, donc ne peut
pas faire basculer le HF du voisin. **Conséquence Ukemi** : dans la plage observée, **aucun mécanisme de cascade
auto-entretenue par le prix via l'oracle Aave** n'est détecté (le seul épisode à gros volume cumulé = l'heure de
crash exogène, b non-signif., prix en rebond en V).

**Échelle.** Σ WETH liquidé Aave (6914,8) / volume Binance `ETHUSDT` de la fenêtre (**2 171 387 ETH**) =
**0,318 %**. Les liquidations WETH d'Aave sont 0,3 % du volume spot → tout Λ est **économiquement négligeable**.

**Cluster-cible Ukemi (USDe/sUSDe), 2025-10-10/11** : **n=2** → **indéterminé par manque de données** (PAS Λ=0).

**sUSDe 2025-02-21 (secondaire, forme brute — n=5, régression impossible).** 5 liquidations dans **2 blocs**
(21895671, 21895693, ~4,4 min) ; Σ saisi ≈ 19,58 M sUSDe (dont 11,79 M sur `0x438403a3`). Oracle **re-mesuré
first-hand** (archive eth_call, 2025-02-20 J-1 → event block 21895693) : **sUSDe 1,1568 → 1,1312 (−2,21 %)**,
**USDe 0,9995 → 0,9772 (−2,23 %)** (= census A §7, désormais first-hand). La décote d'oracle **exogène** (une
vraie décote USDe/sUSDe franchissant le feed) **précède/déclenche** les liquidations groupées — séquence
prix-d'abord, liquidation-ensuite : **consequence, pas cause**. Cohérent avec le cluster WETH.

### Conclusion M-2 (une phrase, règle §4)
**Λ ≠ 0 : INDÉTERMINÉ** — le test lead-lag (le seul qui adresse la causalité inverse) est **sous-puissant**
(n_nonzero=29 < 30) **et** non significatif sur les **deux** feeds (IC95 ∋ 0 ; point-estimé **positif**, signe
opposé à H_Λ) ; la forte association de niveau (β_Qcum≈−1,2e-5, R²=0,39) est **confondue** par le choc exogène
commun et la causalité inverse (corr(Qcum,t)=0,57 ; 88 % du volume dans l'heure de crash ; rebond en V après) ;
échelle 0,318 % du volume spot et |b·Q_typique|≈0,014 % ≪ τ_dev 0,5 % ⇒ **aucune cascade auto-entretenue par le
prix détectable**, tout Λ éventuel étant économiquement négligeable. **Ne pas écrire « cascade » sur 2025-10-10/11
pour Aave.**
*Précédence de règle* (appliquée) : « non » et « indéterminé » se déclenchent tous deux ; **« indéterminé »
l'emporte** — sous-puissance ≠ preuve d'absence. *Robustesse au bord 29-vs-30* : même à n_nonzero ≥ 30, IC95 ∋ 0
sur les deux feeds donnerait « non », **jamais « oui »** — la **direction** du verdict (pas de cascade) est robuste
au seuil. (Bascule Ukemi U-3 : sur le cluster-cible sUSDe l'objet à prix endogène n'est **pas** étayé par cet
événement — B risque de dégénérer en A ; à mesurer sur un cluster où Λ serait identifiable.)

## 7. Provenance / reproductibilité

- **Modèle** `claude-opus-4-8[1m]` (R-1, résolu tel quel), effort max · 2026-09-19 · **aucun commit, aucun workflow
  (R-20)** · sorties hors dépôt (`F:\Monark\docs\biblio\ukemi-modeL\`).
- **Scripts jetables** (Node ESM v24, sélecteurs via keccak self-testé, seeds/blocs épinglés) :
  `scripts-mesure/{m1-archive-cost, m1b-userconfig, m2-lambda, m2b-susde-0221}.mjs`.
- **Sorties + sha256** (`scripts-mesure/out/`) :
  - `m1-results.json` `986cffd931a62d15c28c16105e42c674eb6055e92000fe737b64e1750d972130`
  - `m1b-userconfig.json` `e0069902294b4965bc7ae9e3412320a4d850ed874caa664f445951f7093a34f8`
  - `m2-results.json` `4e4f64a100ebcb6d158b9bcca8b9ddd9e98761ebb0c6167584532405d00acba4`
  - `m2b-susde-0221.json` `2ec19c78758eea8f677dd11d6efa28f2fb6299e4c62c7896c891b76768a9822b`
- **Entrée** `A-rawlogs.jsonl` sha256 `d0f4aa1e23a3eaed6375dca4e6564b7123dfc9ed9b303c1cb7de84dbdae1a996` (= census, recomputé).
- **Reproduction** : `node m1-archive-cost.mjs` ; `node m1b-userconfig.mjs` ; `node m2-lambda.mjs` ;
  `node m2b-susde-0221.mjs`. RPC keyless publics (drpc/mevblocker/blastapi/nodies/tenderly) ; Binance klines publics.
  Les caps/latences RPC sont **horodatés** (variables selon charge réseau) ; les shas de sortie dépendent des
  latences mesurées (M-1) mais **pas** les verdicts (archive OK/quorum, coefficients M-2 = déterministes sur les
  données on-chain + seed).
- **Sources externes [lu] first-hand** : bgd-labs/aave-address-book `src/AaveV3Ethereum.sol` (adresses ; 2/4 recoupent
  census) ; `reference-data-directory.vercel.app/feeds-mainnet.json` ETH/USD (τ_dev `threshold`=0.5, `heartbeat`=3600,
  proxy `0x5f4eC3Df…`) ; Binance `api/v3/klines` (prix/volume marché). WebSearch n'a servi qu'au repérage (valeurs
  τ_dev re-lues dans le JSON ci-dessus, pas prises de la synthèse).
- **Environnement** : `memstack` injoignable cette session (ConnectionRefused) — non utilisé, non bloquant.
- **Dettes** : **zéro**. Item de commodité (non requis) formé : adresse historique du `UiPoolDataProvider` déployée
  ≤ bloc 23545087 (le book par actif est déjà couvert first-hand par `getUserConfiguration`+`balanceOf`, mesuré).
- **Non fait (interdits tenus)** : aucun « aurait alerté », aucun score, aucune extrapolation hors fenêtre, aucun
  « cascade » sans le chiffre Λ. Données brutes pour l'orchestrateur (vérif adversariale R-21).
