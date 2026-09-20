# Census U-3 — étiquettes réelles Y_{i,e} décomposées (repayment / seized / déficit), 3 événements Aave v3 core

## Provenance
Worker `claude-opus-4-8[1m]` (résolu tel quel, R-1), effort max · 2026-09-20 · lot **U-3** (MONARK/Ukemi, ADR-M020 D1 (b)) ·
worktree `F:\Monark-wt-u3`, branche `lot/u-3`, base `13b8391` · réviseur = orchestrateur (R-21) · **aucun commit, aucun
workflow (R-20)**. Pré-enregistrement `docs/PLAN-u3-prereg.md`, **sha LF `835805ccc9941a101e760f4ca570f8bdb5ab30d5280e1897c473df7c788877d3`**
calculé et consigné **AVANT** tout appel réseau (C-10) ; le script `scripts/census/u3-realized.mjs` a refusé de démarrer
sans `--prereg-sha` égal à ce sha.

- **Fournisseurs (domaines seuls, jamais d'URL ni de clé)** : `archive-env` (fournisseur archive par `CHAINSTACK_ETH_URL`,
  env, jamais imprimé) + les keyless de `apps/sentinel/src/rpc.ts` (`drpc.org`, `mevblocker.io`, `blastapi.io`). **Quorum-2
  par méthode** (ADR-U1 D3) : deux **opérateurs distincts** (`providerOf`) renvoyant des octets identiques ; sinon
  `no_quorum` ⇒ ligne abstenue (aucune abstention n'a été nécessaire : 198/198 lignes servies).
- **Coût mesuré** : **1 961 appels RPC, ~210 s** (run complet 3 événements). Resumable (cache de bruts hors dépôt). Bruts
  concordants archivés **hors dépôt** sous `F:\PRODUITS\etude-2026-09-20\u3-raws\`, sha-pinnés en `PROVENANCE-u3.md`.
- **Séries** (réduites, sha-pinnées, C-2/C-3) : `apps/sentinel/test/fixtures/ukemi/u3/{U3-realized,U3-sources,U3-deficit,U3-inputs}.jsonl`.
  Montants base en **8 décimales** (`BASE_CURRENCY_UNIT()` lu on-chain = `100000000`) ; `$` = base/1e8.

## 1. Faits [lu] établis AVANT le pull (source = A-rawlogs.jsonl `d0f4aa1e…`, vérifié au démarrage)
Les 3 événements et leurs sommes `debtToCover` par debtAsset sont lus dans `A-rawlogs.jsonl` (C-1), déterministes sans
réseau ; e1 et e3 sont pré-chiffrés à l'unité (§ U3-H3). Le cluster e2 = collatéral WETH, bloc ∈ [23545088, 23557060]
(M-2b §2.4, sha-pinné) — **reproduit : 268 appels, 119 blocs, 213 users, 219 positions**, gap net de 2839 blocs avant
B_first=23545088.

## 2. Résultats par événement (mesuré on-chain, quorum-2 ; chaque chiffre = lignes de `U3-realized.jsonl`)

| e | date | collatéral | B_first | B_last | appels in-window | positions | outside_window | impl @B_first | pré-v3.3 |
|---|---|---|---|---|---|---|---|---|---|
| e1 | 2025-02-21 | sUSDe | 21895671 | 21902824 | 5 | **3** | 0 | `0xef434e45…` | oui |
| e2 | 2025-10-10/11 | WETH | 23545088 | 23552238 | 239 | **194** | 29 | `0x97287a4f…` | non |
| e3 | 2026-01-19 | sUSDe | 24266439 | 24273612 | 1 | **1** | 0 | `0x8147b99d…` | non |

Fenêtre 24 h ancrée bloc : `B_last = firstBlockAtOrAfter(ts(B_first)+86400) − 1` (`windows.ts`, ts en quorum-2). Les 3
implémentations sont **distinctes** ; e1 est **pré-v3.3** (v3.3 déployée 2025-02-24 > 2025-02-21) ⇒ `deficit_topic_absent`
par construction (C-6).

### Σ décomposées (base 8 déc. ; `$` = /1e8)
| e | Σ repayment_base | ≈ $ | Σ seized_base | ≈ $ | Σ deficit_base | ≈ $ |
|---|---|---|---|---|---|---|
| e1 | 2 138 415 648 203 963 | 21 384 156 | 2 215 398 611 539 306 | 22 153 986 | 0 | 0 |
| e2 | 2 408 136 363 987 453 | 24 081 364 | 2 516 459 597 649 969 | 25 164 596 | 18 010 445 414 122 | 180 104 |
| e3 | 332 145 826 379 787 | 3 321 458 | 341 412 694 935 783 | 3 414 127 | 0 | 0 |

e1 ≈ 21,38 M$ et e3 ≈ 3,32 M$ **recoupent** le census A §7 (2025-02-21 ≈ 21,38 M ; 2026-01-19 ≈ 3,32 M). `seized > repayment`
partout (prime de liquidation ; le frais protocole treasury est **exclu** de `seized`, C-7).

### Résidus (198 lignes)
`partial_liquidation` **162** (boucles HF≈1,00 partiellement liquidées, close factor < 100 %) · `price_moved_in_block`
**108** (l'oracle a bougé dans le bloc de liquidation — feed WETH SVR backrun-only, M-2b §4.6 ; non corrigé, C-9) ·
`deficit_topic_absent` **3** (e1) · `deficit` **4** (positions WETH avec bad debt) · `deficit_base_no_price` **1** (déficit
sur une réserve dont le prix n'a pas été tiré au bloc — natif conservé, base omise) · **19** lignes à résidu vide (liquidations
pleines, cross-check exact).

## 3. Sources d'oracle par actif (U3-H2) — `U3-sources.jsonl`, aux deux bornes (B_first−1, B_last)
**TENUE** : aucune source ne change dans la fenêtre 24 h d'aucun événement (`source_change=false` partout).
- e1 : sUSDe `0xb37ae8ab…` **« Capped sUSDe / USDe / USD »** (feed pré-bascule, référencé USDe) ; USDC `0x736bf902…` ; USDT `0xc26d4a1c…`.
- e2 : WETH `0x5424384b…` **« ETH / USD »** (feed **SVR** backrun-only, M-2b) ; 13 debtAssets à sources stables (dont GHO
  `0xd110cac5…` sans `description()` ⇒ `""` par revert concordant, ADR-U1 V-1).
- e3 : sUSDe `0x42bc86f2…` **« Capped sUSDe / USDT / USD »** (feed **post-bascule** 22002625, référencé USDT) ; USDC `0x3f73f03a…`.

La bissection (C-10) se réduit au **contrôle aux deux bornes** : les bascules connues (sUSDe/USDe 22002625, WETH SVR
22803459) sont **hors** de ces trois fenêtres, donc sources constantes — cohérent avec M-2b.

## 4. Déficit (U3-H1) — `U3-deficit.jsonl`, source autoritaire = `getLogs(Pool, DeficitCreated, [B_first,B_last])`
**U3-H1 satisfaite** : `DeficitCreated` apparaît dans **e2** (post-v3.3). **28 déficits** dans la fenêtre e2, classés :
- **4 `in_event`** (user ∈ positions WETH, join par `(user, debtAsset)`) : bad debt réel de boucles WETH (CRV ×3, USDT ×1),
  Σ ≈ **180 104 $** — c'est le `deficit_base` de e2.
- **24 `window_other`** : bad debt de liquidations d'**autres collatéraux** dans la même fenêtre de krach (mesuré : 23 des 27
  users déficit distincts ne sont pas des liquidations WETH) — **hors** cluster WETH, rapporté pour contexte, ne contribue à
  **aucun** Y_{i,e}.
**Contrôle positif (C-8)** : les 4 `in_event` (et les 24 `window_other`) sont des `DeficitCreated` **réels** décodés on-chain
après l'upgrade ⇒ le filtre (topic `0x2bccfb3f…`, keccak self-testé) attrape une émission réelle. e1 pré-v3.3 : `deficit_topic_absent`.
e3 : 0 déficit (liquidation bénigne unique).

## 5. U3-H3 — identité de pipeline (Σ repayment natif = Σ debtToCover des lignes retenues)
**VÉRIFIÉE à l'unité** (test CI `u3_sum_repayment_matches_census_a`) :
- **e1** : USDC **8 511 568 493 136** + USDT **12 871 019 904 705** (pré-chiffrés au prereg, MATCH exact).
- **e3** : USDC **3 322 388 532 587** (pré-chiffré, MATCH exact).
- **e2** : Σ repayment natif par debtAsset in-window = Σ `debtToCover` des mêmes lignes de A-rawlogs (identité au runtime,
  test `u3_sum_repayment_matches_census_a`). **Vérifié hors CI** (déterministe depuis A-rawlogs) : Σ in-window **≤** ancres
  cluster pré-chiffrées pour **les 14 debtAssets** (strict `<` pour USDT/USDC/DAI/GHO et **USDe entièrement hors fenêtre**
  0 vs 3 149 474 628 084 093 755 545 ; les 29 `outside_window` expliquent l'écart) — les ancres cluster ne sont **pas**
  re-testées en CI (seule l'identité l'est). Cross-check C-7 sur les `Transfer` underlying (repayment = `Transfer(liquidateur
  → aToken(debt))`, seized = `Transfer(aToken(coll) → liquidateur)`) : **couverture complète** — **228 tx distinctes** (245
  appels e1+e2+e3) ont chacune leurs `Transfer` de receipt (0 appel sans receipt), **0 `xfer_mismatch`** (une row sans repayment
  **ou** seized apparié aurait `xfer_mismatch` ; mutant M5 le prouve non-vacide).

## 6. n_e vs seuils de Dunn (Thm 11, `n > 1/α − 1`) — **aucune conclusion sur α** (décision U-4)
| événement | positions n_e | > 99 (α=0,01) | > 19 (α=0,05) | > 9 (α=0,10) |
|---|---|---|---|---|
| e1 | 3 | non | non | non |
| e2 | 194 | **oui** | oui | oui |
| e3 | 1 | non | non | non |
Seul **e2** dépasse 99 (avant stratification Mondrian e-mode × HF₀ × taille) ; toute strate sous 100 positions abstiendra
(`under_calib`). Le choix d'α et la calibration sont **hors périmètre** (U-4).

## 7. Écarts aux hypothèses et limites (zéro dette)
- **U3-H1** : tenue (e2 porte 28 `DeficitCreated`). Nuance mesurée : la majorité du bad debt de la fenêtre e2 (24/28) vient
  d'autres collatéraux — le cluster WETH ne porte que 4 déficits (~180 k$).
- **U3-H2** : tenue (sources constantes) — bascules connues hors fenêtres.
- **U3-H3** : tenue à l'unité (e1/e3 pré-chiffrés ; e2 identité + cross-check).
- **Positions e2 = 194** (le proxy 7200 blocs du prereg donnait 194 ; le « ≈189 » du checkpoint C-5 était approximatif — corrigé
  par la mesure ; B_last réel = 23552238).
- `deficit_base_no_price` (1 ligne) : un déficit sur une réserve dont le prix n'a pas été tiré au bloc du déficit ; `deficit_native`
  conservé, conversion base omise et **signalée** (jamais une tolérance muette). Item **non bloquant** (le natif suffit à Y_{i,e}
  pour la calibration U-4 ; la conversion base de ce cas est un item de commodité).
- e2 `outside_window` = 29 appels du cluster (bloc > B_last) comptés en résidu, hors Σ (le cluster déborde ~40 h, M-2b).
- Portée : K = 3 événements ; hypothèse n_j fixé a priori (Dunn) **violée et déclarée** (ADR-M020).

### Déviations au pré-enregistrement (déclarées, zéro dette)
- **D-1 — Leg déficit — set-equality abandonnée.** Le prereg §5 pré-enregistrait une **égalité d'ensemble** entre les
  `DeficitCreated` extraits des **receipts** et ceux du **getLogs fenêtre**. Mesuré : les receipts ne voient que les tx de
  liquidation **WETH** (le cross-check est par tx), or **24 des 28** déficits de la fenêtre e2 viennent de liquidations
  d'**autres collatéraux** (23 des 27 users déficit distincts ne sont pas des users WETH). ⇒ leg receipts **retiré** pour le
  déficit (conservé pour le cross-check Transfer C-7), leg getLogs fenêtre rendu **autoritaire** (complet). La set-equality
  n'est **pas** testée ; la relation mesurée est receipts ⊆ fenêtre (4 in_event ⊆ 28). Déviation assumée, `error_origin`
  worker (l'attente du prereg était fausse ; la mesure la corrige).
- **D-2 — Classes de résidu post-hoc** (hors liste fermée du prereg §5 `partial_liquidation, source_change, no_quorum,
  deficit_topic_absent, outside_window, xfer_mismatch, price_moved_in_block, bad_debt_other_reserve`) : **`deficit`** (marqueur
  d'une position portant ≥ 1 `DeficitCreated` joint), **`window_other`** (déficit d'un autre collatéral dans la fenêtre, kind
  de `U3-deficit.jsonl`, jamais un résidu de position), **`deficit_base_no_price`** (déficit `bad_debt_other_reserve` sans prix
  au bloc ⇒ base omise, natif conservé), **`receive_atoken`** (jamais rencontré : 0 cas `receiveAToken=true`). Ajouts déclarés,
  chacun justifié ; aucun ne masque une abstention.
- **D-3 — Bruts hors dépôt** : PROVENANCE cite `u3-raws-clean/` (run **à froid**, sha reproductible `0afaf605…`) et non le
  `u3-raws/` par défaut (run tiède + lectures CAPO du smoke test = sur-ensemble) — choix pour un sha de bruts propre et
  reproductible ; les deux runs donnent des séries byte-identiques.
- **D-4 — Implémentation résolue par état on-chain (`eth_getStorageAt`, slot EIP-1967) @B_first, pas par le dernier
  `Upgraded(impl) ≤ B_first`.** Le prereg §5 C-6 pré-enregistrait la résolution par le dernier log `Upgraded ≤ B_first` ;
  le script résout l'impl par `eth_getStorageAt(POOL, EIP1967_IMPL_SLOT, B_first)` (`u3-realized.mjs:449` ; slot
  `0x360894a1…` = keccak256("eip1967.proxy.implementation") - 1, `mjs:42`). `UPGRADED_TOPIC` est **défini et self-testé**
  (`mjs:51`/`:55`) mais **jamais consommé** (aucun autre usage dans le script). Déviation assumée, `error_origin` **worker** :
  `eth_getStorageAt` lit l'**état réel** du proxy au bloc (quorum-2) — **plus autoritaire** qu'un scan de logs qui pourrait
  manquer un `Upgraded` ultérieur ; l'impl n'est qu'une **métadonnée corroborante**. Le statut **pré-v3.3** de e1 est codé
  en dur (`EVENTS[e1].preV33 = true`, `mjs:71`) sur la **date de déploiement v3.3 (2025-02-24, ADR-M020 D6 [lu]) > 2025-02-21**,
  pas sur l'impl ni son tag. **Immatérielle** à toute étiquette Y_{i,e}.
- **Vérification Blockscout par événement — non faite comme étape distincte tracée** (prereg §5). Le prereg prévoyait « un
  receipt par événement vérifié Blockscout avant généralisation : e1 `0x6290d4…333c`, e2 (tx @23545088), e3 `0xeb20d0…4aff` ».
  Le mot « Blockscout » n'apparaît que dans le prereg (grep) ⇒ **non faite** comme étape distincte. **Substance couverte** par
  le re-tirage receipt quorum-2 de la G2 (§3) : e1 `0x6290d4…333c` et e3 `0xeb20d0…4aff` re-vérifiés on-chain à l'unité
  (dtc/liqColl exacts) ; e2 est couvert par une **autre** tx du même événement (`00d48aed` @23549385, pas la tx @23545088
  nommée au prereg). **Item formé, non bloquant** (PLI §8) : déclencheur = contrôle hors-RPC exigé par U-7/relecteur externe ;
  propriétaire orchestrateur.

*Aucune phrase publique. Données brutes pour l'orchestrateur (R-21). Chaque chiffre trace à une ligne de `U3-*.jsonl`
rejouable depuis `U3-inputs.jsonl` (4 tests CI) sans réseau.*
