# Census (B) — burns décomposés par brûleur, quatre populations (FDUSD, sUSDe, USDtb, GHO)

> **Provenance.** MONARK, branche `lot/census-next-piece`, HEAD `72aa565` (pré-enregistrement). Worker
> **`claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` vérifié, effort max), 2026-09-18. Rattachement :
> `docs/PLAN-census-next-piece.md` (B-H1..B-H4), `docs/AUDIT-next-piece-2026-09-18.md` §3 (branche
> `docs/audit-next-piece`), `SCOUTING-F-fdusd.md`, `INVENTAIRE-stables.md`. **MESURE SEULEMENT** : aucune
> calibration, aucune fixture de série, aucune phrase publique, aucun seuil ajouté après coup. Lecture seule
> sur RPC publics **sans clé** ; aucune autre action sortante. Seuils F2-B réutilisés (pré-enregistrés) :
> `θ_stress = 1 % S_open`, `S_floor = 10 M`, `ρ_min = 0,30`. Sortie vérifiable (R-21) ; l'orchestrateur
> vérifie adversarialement. Aucun commit (R-20).

## 0. Méthode et infrastructure (mesurée le 2026-09-18)

**Script** : `scripts/census/burns-by-burner.mjs <token>` (paramétré par token, resumable JSONL). Réutilise
la couche RPC/fenêtres de `scripts/usde-full-pull.mjs` (pool + cooldown par endpoint, split récursif de
`getLogs` sur result-limit, `sumBurnsMints` `top byFrom`, identité C1, `v_t`) et **importe sans
modification** `apps/sentinel/src/windows.ts` (`daysUTC`, `firstBlockAtOrAfter`). **Quorum** ajouté depuis
`apps/sentinel/src/rpc.ts` (`providerOf`, `QuorumDisagreementError`) : chaque agrégat de fenêtre
(burns/mints/`byFrom` **et** `totalSupply`) est recalculé sur **deux fournisseurs distincts** (`providerOf`,
donc les deux alias Tenderly comptent pour un) ; les octets doivent coïncider sinon la fenêtre est marquée
`disagree`. Moins de deux fournisseurs répondant ⇒ `no_quorum` (valeur unique conservée et signalée), jamais
d'exclusion silencieuse.

**Sélecteurs/topics — [lu], dérivés par un keccak256 embarqué auto-validé au démarrage** contre la vérité
terrain (`keccak256("")=c5d24601…5d85a470`, topic `Transfer(address,address,uint256)=0xddf252ad…3b3ef`,
sélecteurs `totalSupply()=0x18160ddd`, `balanceOf(address)=0x70a08231`, `transfer(address,uint256)=0xa9059cbb` ;
abort si un seul écart). Dérivés : `cooldownShares(uint256)=0x9343d9e1`, `cooldownAssets(uint256)=0xcdac52ed`,
`getFacilitatorsList()=0x1ec90f2e`, `getFacilitator(address)=0xd46ec0ed`, `silo()=0xeb3beb29`.

**Adresses / métadonnées vérifiées [lu] on-chain** (`eth_call symbol()`/`decimals()`, source = le contrat) :
| Token | Adresse | symbol() | decimals() | source adresse |
|---|---|---|---|---|
| FDUSD | `0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409` | `FDUSD` | 18 | SCOUTING-F-fdusd.md [lu] |
| sUSDe | `0x9d39a5de30e57443bff2a8307a4256c8797a3497` | `sUSDe` | 18 | INVENTAIRE / mission [lu] |
| GHO | `0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f` | `GHO` | 18 | mission / INVENTAIRE [lu] |
| USDtb | `0xC139190F447e929f090Edeb554D95AbB8b18aC1C` | `USDtb` | 18 | investisseur 2026-09-18 (Ethena/Etherscan) + `eth_call` orchestrateur & worker [lu] ; voir §3 |

**Endpoints publics — matrice de capacité mesurée 2026-09-18 (sans clé)** : le pool de `usde-full-pull.mjs`
n'est **PAS réutilisable tel quel** (le fixture USDe a été tiré le 2026-09-17, mais les endpoints ont depuis
verrouillé) :
| Endpoint | getLogs archive | eth_call archive (supply) | note |
|---|---|---|---|
| `rpc.mevblocker.io` | **OUI** | oui | 1 des 2 seuls fournisseurs getLogs-archive |
| `gateway.tenderly.co` / `mainnet.gateway.tenderly.co` | **OUI** | oui | `providerOf`=`tenderly.co` (un seul fournisseur) |
| `eth.drpc.org` | non (HTTP 400) | **oui** | offloadé pour supply |
| `eth-mainnet.public.blastapi.io` | non (HTTP 400) | **oui** | offloadé pour supply |
| `eth-pokt.nodies.app` | non (cap 50 blocs) | oui | supply de secours |
| `ethereum-rpc.publicnode.com` / `ethereum.publicnode.com` | non (HTTP 403) | non (403) | primaire du pull USDe, désormais fermé |
| `eth.llamarpc.com`, `rpc.payload.de`, `api.securerpc.com` | échec DNS | — | inutilisables ici |
| `rpc.ankr.com/eth` | clé requise | — | — |
| `1rpc.io/eth` | cap 50 blocs | — | — |
| `eth.rpc.blxrbdn.com` | méthode indispo | — | — |
| `rpc.flashbots.net` | **partiel + FAUX SILENCIEUX** | non (403) | a renvoyé **0 log** sur janv-2025 là où mev+tenderly renvoyaient 8 — l'erreur exacte que le quorum attrape |

**Conséquence** : les **seuls deux fournisseurs distincts servant `eth_getLogs` archive sans clé** sont
`mevblocker.io` et `tenderly.co`. Ils ont renvoyé des résultats **octet-pour-octet identiques** sur 3
recoupements archive (231 logs avril-2025, 8 logs janv-2025, supply 2 341 751 540 FDUSD) : le quorum de flux
repose sur eux. **Le scouting FDUSD avait classé `mevblocker` « suspect / résultat vide » — cette passe le
réhabilite** par accord byte-identique avec Tenderly ; le vrai faux-silencieux est `flashbots`, pas
`mevblocker`. Le supply/quorum est offloadé sur `drpc.org`+`blastapi.io` pour que `mevblocker`/`tenderly` ne
soient sollicités qu'une fois par fenêtre (aucun rate-limit ⇒ **0 `no_quorum`, 0 `disagree`** sur 481
fenêtres). Fenêtres ancrées bloc via `firstBlockAtOrAfter` (interpolation ~12,06 s/slot pour amorcer un
bracket étroit, puis recherche `windows.ts` inchangée) ; fin de plage récente bornée par `finalized`.

**Identité C1 et quatre-fournisseurs** : C1 par fenêtre = `S_open == S_close + burns − mints` (le supply
augmente des mints, décroît des burns). Le **flux** (burns/mints) vient de `mevblocker.io`+`tenderly.co`, le
**supply** de `drpc.org`+`blastapi.io` — deux paires de fournisseurs **disjointes** ; C1 les relie par une
identité arithmétique et **tient sur 481/481 fenêtres**. C'est **quatre fournisseurs qui concordent via une
identité** (bien plus fort que 3 recoupements ponctuels pour réhabiliter `mevblocker`, et l'argument contre
« les deux fournisseurs de flux partageaient une même erreur » : une erreur de flux casserait C1 contre un
supply indépendant).

**Continuité inter-fenêtres (vérifiée localement, `scripts/census` hors CI)** : C1 est *intra*-fenêtre ; un
trou/chevauchement *entre* fenêtres adjacentes passerait C1 mais raccourcirait les totaux mensuels. Vérifié :
sur chaque plage contiguë, `toBlock(D)+1 == fromBlock(D+1)` **et** `supplyClose(D) == supplyOpen(D+1)` — **269
(FDUSD) + 29 (sUSDe) + 89 (GHO) + 89 (USDtb) = 476 coutures, 0 échec** (seule discontinuité : FDUSD
2025-06-30 → 2026-06-20, attendue). **Inter-populations** : sur les 90 jours partagés de 2026, les bornes
`fromBlock/toBlock` sont **identiques** entre FDUSD, GHO, sUSDe et USDtb (**210 comparaisons, 0 écart**) —
quatre processus indépendants, bornes byte-identiques (la propriété de la sentinelle, démontrée et non postulée).

**Budget d'appels** : sondes ≈115 (estimé — la sonde d'endpoints n'a pas de compteur) + pilotes ~886 (réglage
endpoints/coût, JSONL jetés) + FDUSD 2 136 + sUSDe 302 + GHO 822 + USDtb 829 = **≈5 108 appels réseau au
total** (cap mission 6 000 — **non dépassé**). Fournisseurs de flux effectivement utilisés : `mevblocker.io` +
`tenderly.co` (481/481 fenêtres) ; supply : `drpc.org` + `blastapi.io` (481/481). Le JSONL FDUSD a été produit
en **deux invocations** (pilote 32 fenêtres puis reprise resumable ; le sha256 couvre le fichier fusionné, et
la couture pilote→reprise est incluse dans les coutures vérifiées ci-dessus). USDtb : run séparé après
résolution de la procurement d'adresse (§3).

---

## 1. FDUSD — B-H1

Fenêtres UTC quotidiennes : **2025-01-01 → 2025-06-30** (181 j, run 2025-04-03 tenu hors-échantillon, juste
rapporté) **+ 90 derniers jours** (2026-06-20 → 2026-09-17). 271 fenêtres, **toutes `ok`**, C1 vrai partout,
0 `disagree`, 0 `no_quorum`. Quorum flux = `mevblocker.io`+`tenderly.co` ; supply = `drpc.org`+`blastapi.io`.

| Mois | jours | burns (FDUSD) | mints (FDUSD) | S_close (FDUSD) | top-3 brûleurs (part) | churn calme méd. %/j | C1 échecs | `disagree` |
|---|---|---|---|---|---|---|---|---|
| 2025-01 | 31 | 636 921 877 | 240 400 086 | 1 736 502 452 | `0xfa7718…4d6a66` 100 % | 0,0000 (nz 4/20) | 0 | 0 |
| 2025-02 | 28 | 476 839 141 | 427 623 691 | 1 687 287 001 | `0xfa7718…4d6a66` 100 % | 0,0000 (nz 3/19) | 0 | 0 |
| 2025-03 | 31 | 171 337 014 | 812 574 151 | 2 328 524 139 | `0xfa7718…4d6a66` 100 % | 0,0000 (nz 7/27) | 0 | 0 |
| 2025-04 | 30 | 1 343 966 911 | 248 537 470 | 1 233 094 698 | `0xfa7718…4d6a66` 100 % | 0,0000 (nz 3/15) | 0 | 0 |
| 2025-05 | 31 | 74 688 171 | 274 992 913 | 1 433 399 440 | `0xfa7718…4d6a66` 100 % | 0,0000 (nz 5/28) | 0 | 0 |
| 2025-06 | 30 | 478 516 410 | 89 230 827 | 1 044 113 857 | `0xfa7718…4d6a66` 100 % | 0,0000 (nz 4/18) | 0 | 0 |
| 2026-06 | 11 | 2 400 000 | 0 | 242 316 570 | `0xfa7718…4d6a66` 100 % | 0,0000 (nz 1/11) | 0 | 0 |
| 2026-07 | 31 | 5 011 000 | 5 050 000 | 242 355 570 | `0xfa7718…4d6a66` 100 % | 0,0000 (nz 4/31) | 0 | 0 |
| 2026-08 | 31 | 21 287 303 | 5 176 000 | 226 244 267 | `0xfa7718…4d6a66` 100 % | 0,0000 (nz 5/29) | 0 | 0 |
| 2026-09 | 17 | 10 077 000 | 0 | 216 167 267 | `0xfa7718…4d6a66` 100 % | 0,0000 (nz 3/15) | 0 | 0 |

- **Brûleur unique** : **100,00 %** des 3 221 044 827 FDUSD brûlés (10 mois) proviennent de la seule adresse
  `0xfa771871d3d5c85e156d3d379e2ff7699c4d6a66` (Safe First Digital, cf. SCOUTING). **1 seul brûleur** sur
  toutes les fenêtres. **≥ 95 % ⇒ CONFIRMÉ (100 %).**
- **mint+burn même tx** : **0 fenêtre** (aucun aller-retour flash ; mint et burn ne coexistent jamais dans
  la même tx).
- **Run hors-échantillon 2025-04-03** : burns = 194 901 073 FDUSD (21 events), S_open = 2 341 751 541,
  **burns/S_open = 8,323 %/24 h**, `v_t` = 3,468e-3/h, C1 vrai. **≥ 5 %/24 h ⇒ CONFIRMÉ (8,32 %).**
  (Cohérent avec le scouting = 8,37 % ; petit écart = bloc de référence S_open différent.)
- **C1** : **0 échec / 271 fenêtres ⇒ CONFIRMÉ** (« C1 tient sur toutes les fenêtres »). Le filtre burn est
  `Transfer → 0x0` strict ; C1 tenant partout établit que **tout** changement de `totalSupply` est capté par
  `Transfer ↔ 0x0` (donc pas de burn-vers-`0x…dEaD` manquant affectant le supply — le point « NON TESTÉ » du
  scouting §2 est ici clos par complétude C1).
- **Recoupement externe indépendant (unité près)** : mon `S_close(2025-03)` mesuré = **2 328 524 139** =
  exactement la référence `totalSupply` du 2025-04-01 du scouting (2 328 524 138,71). Et mon
  `S_open(2025-04-03)` = **2 341 751 541** = 2 328 524 138,71 + 53 227 402 (mints du 2 avr., scouting) −
  40 000 000 (burns des 1–2 avr., scouting) = 2 341 751 540,71. Deux reconstructions indépendantes concordent
  à l'unité.
- **Churn calme quotidien médian** (métrique pré-enregistrée = médiane de burns/S_open sur les fenêtres avec
  burns < 1 % S_open **et** S_open ≥ 10 M) : ensemble = 213 fenêtres dont **39 seulement à burns > 0** ;
  **médiane = 0,0000 %/j** (la fenêtre médiane a 0 burn). Médiane sur les seules fenêtres calmes à burns > 0
  = **0,4983 %/j**. Jours à ≥ 1 burn (hors holdout) : 96/270. **≥ 0,5 %/j ⇒ NON ATTEINT (0,0000 %/j)** — les
  rachats sont **en rafales** (bursty), pas un flux quotidien lissé ; même la médiane des jours non nuls
  (0,4983 %/j) reste sous le seuil. *Rapporté tel quel, sans reframe (le seuil pré-enregistré n'est pas
  déplacé).*
- **Contexte non-stationnarité** : supply ÷ ~10 sur la période (1 736 M en janv-2025 → pic 2 328 M mars →
  1 233 M après le run avril → 216 M sept-2026 ; 2026-09 S_close 216 167 267 = exactement le chiffre scouting
  2026-09-15). Jours calmes hors-holdout dépassant 5 %/24 h : **2025-04-07 (9,96 %, max absolu, régime de
  stress prolongé), 2025-04-04 (7,45 %), 2025-01-21 (6,46 %), 2025-02-28 (5,93 %)** — le signal « run » n'est
  donc **pas propre au seul 2025-04-03** (séparation calme/run modeste, cohérent scouting).

**VERDICT B-H1 — partiellement confirmée.** Brûleur unique (100 %), run ≥ 5 %/24 h (8,32 %) et C1 (0/271)
CONFIRMÉS. Le sous-critère « churn calme **quotidien** médian ≥ 0,5 %/j » **échoue** (0,0000 %/j) car les
burns sont en rafales — la propriété de churn non-dégénéré du scouting était **hebdomadaire**, pas
quotidienne. Aucune calibration committée (mesure seulement).

---

## 2. sUSDe — B-H2

30 fenêtres UTC quotidiennes (2026-08-19 → 2026-09-17), **toutes `ok`**, C1 vrai partout, 0 `disagree`, 0
`no_quorum`. Plus une analyse ciblée `cooldownShares`/`unstake`.

**(a) `cooldownShares(uint256)` émet-il `Transfer(owner → 0x0)` sur sUSDe et fait-il décroître `totalSupply` ?**
3 tx réels récents lus (`eth_getTransactionByHash` + `eth_getTransactionReceipt`, sélecteur `0x9343d9e1`) —
`silo()` vérifié on-chain = `0x7fc7c91d556b400afa565013e3f32055a0713425` (confirme l'adresse « non recoupée »
de l'INVENTAIRE) :
| tx | bloc | sélecteur top-level | contrat appelé | shares brûlées | arg==shares | Transfer→0x0 sUSDe | ΔtotalSupply==shares |
|---|---|---|---|---|---|---|---|
| `0xb0b44df489b18c2e…` | 25905257 | `0x9343d9e1` cooldownShares | `0x9d39a5de…` (sUSDe) | 253 095,82 | **oui** | **oui** | **oui** |
| `0xa64734de4c39fcf7…` | 25905260 | `0xa3049642` (routeur) | `0xceda2d85…` | 28 240,00 | non | **oui** | **oui** |
| `0xc2d7e2908e77dd80…` | 25905271 | `0x9343d9e1` cooldownShares | `0x9d39a5de…` (sUSDe) | 202 154,08 | **oui** | **oui** | **oui** |

Les 3 tx **brûlent bien sUSDe vers 0x0 et décrémentent `totalSupply` d'exactement les shares** ; 2/3 sont des
appels directs `cooldownShares` (arg == shares, discriminant vs `cooldownAssets`), le 3ᵉ passe par un contrat
intermédiaire (`0xceda2d85…`) mais produit la même sémantique de burn. **CONFIRMÉ.**

**(b) `unstake` n'émet-il rien sur le token sUSDe ?** 639 `Transfer` USDe **depuis le silo**
`0x7fc7c91d…` sur 14 j. Échantillon `0x17c2fd389e827a48…` : 400 190,28 USDe sortis du silo, **le reçu ne
touche AUCUN log du token sUSDe** (`receiptTouchesSusde=false`). **CONFIRMÉ** : le burn sUSDe a lieu à
**l'entrée dans la file** (`cooldownShares`), pas à la sortie (`unstake`).

| Mois | jours | burns (sUSDe) | mints (sUSDe) | S_close (sUSDe) | top-3 brûleurs (part) | churn calme méd. %/j | brûleurs distincts | C1 | `disagree` |
|---|---|---|---|---|---|---|---|---|---|
| 2026-08 | 13 | 142 929 842 | 112 244 859 | 1 076 462 212 | `0x9ffe7714` 21,3 % / `0xcf0a12cb` 10,5 % / `0x676d1ba4` 6,8 % | 0,4858 (nz 7/7) | 212 | 0 | 0 |
| 2026-09 | 17 | 192 233 483 | 168 170 856 | 1 052 399 586 | `0x5c2c1aa8` 11,9 % / `0x8b41013f` 7,4 % / `0xa9f86d9e` 5,3 % | 0,6004 (nz 8/8) | 295 | 0 | 0 |

- Population **très diversifiée** : 335 163 324 sUSDe brûlés sur **437 brûleurs distincts** (top global 9,08 %) —
  l'inverse structurel de FDUSD. Churn **quotidien** (30/30 jours à burns > 0), médiane calme 0,5220 %/j
  (au-dessus de 0,5 %/j — mais c'est la loi « entrée de file / déstaking avec cooldown 1–7 j », **pas** le
  rachat USD 24/7 d'USDe).
- **mint+burn même tx** : **0 fenêtre** (les burns d'entrée-de-file et les mints de staking ne coexistent pas
  dans une même tx).

**VERDICT B-H2 — CONFIRMÉE.** `cooldownShares` ⇒ `Transfer(owner→0x0)` sur sUSDe + `totalSupply` décroissant
(3/3 tx) ; `unstake` n'émet rien sur sUSDe (639 sorties de silo, échantillon sans log sUSDe). Les burns de
sUSDe = **entrées dans la file** (classe distincte de la loi USDe, cooldown), à ne jamais pooler avec USDe.

---

## 3. USDtb — B-H3 (procurement résolu 2026-09-18, mesuré)

**Adresse — [lu]** : `0xC139190F447e929f090Edeb554D95AbB8b18aC1C` (Ethereum mainnet, ERC-20 USDtb).
**Provenance** : procurement formée (§6, désormais close) résolue par l'**investisseur** le 2026-09-18 (docs
officielles Ethena + tweet de lancement @ethena + tag Etherscan), vérifiée par l'**orchestrateur** via
`eth_call` (symbol USDtb, decimals 18, totalSupply ≈ 483 128 603), **puis re-vérifiée par ce worker** au
démarrage du run (`eth_call symbol()="USDtb"`, `decimals()=18`, via `blastapi.io`). **Ce n'est pas USDe.**

90 fenêtres UTC quotidiennes (2026-06-20 → 2026-09-17), **toutes `ok`**, C1 vrai partout, 0 `disagree`, 0
`no_quorum` ; continuité inter-fenêtres 0 échec (89 coutures), bornes byte-identiques à GHO sur les 90 jours
partagés (90/90). Quorum flux = `mevblocker.io`+`tenderly.co` ; supply = `drpc.org`+`blastapi.io`.

| Mois | jours | burns (USDtb) | mints (USDtb) | S_close (USDtb) | top brûleur (part mois) | churn calme méd. %/j | C1 | `disagree` |
|---|---|---|---|---|---|---|---|---|
| 2026-06 | 11 | 192 976 820 | 12 343 134 | 736 104 237 | `0xafbb1a7e…` 99,49 % | 0,0000 (nz 3/10) | 0 | 0 |
| 2026-07 | 31 | 391 351 161 | 7 978 888 | 352 731 964 | `0xafbb1a7e…` 98,18 % | 0,0000 (nz 13/28) | 0 | 0 |
| 2026-08 | 31 | 126 416 148 | 257 072 213 | 483 388 029 | `0xafbb1a7e…` 95,71 % | 0,0000 (nz 12/29) | 0 | 0 |
| 2026-09 | 17 | 3 800 928 | 3 558 676 | 483 145 776 | `0xfcfb9e3c…` 52,61 % | 0,0000 (nz 7/17) | 0 | 0 |

- **Concentration des brûleurs** : 714 545 057 USDtb brûlés sur 90 j. Par **compte** = **22 brûleurs
  distincts**, donc « ≤ 3 » **littéralement faux** ; mais 19 d'entre eux sont de la **poussière** (souvent
  exactement 1–10 USDtb). Top-3 en **montant** :
  `0xafbb1a7e9ddef38d9bc4a220e702b18dacaa2a62` **97,72 %** (698,3 M), `0xfcfb9e3c6758c90929c45938c6c675e4b359911d`
  1,84 %, `0x11a3193d63aa533988cbc07a8b37bbd148fca2fb` 0,20 % — **top-3 = 99,76 %**, **un seul brûleur
  institutionnel dominant** (≈ FDUSD). « ≤ 3 » vrai en substance économique.
- **mint+burn même tx** : **0 fenêtre**.
- **Churn calme quotidien médian** (fenêtres burns < 1 % S_open **et** S_open ≥ 10 M ; ensemble = 84 fenêtres
  dont 35 à burns > 0) : **médiane = 0,0000 %/j** ; médiane jours-non-nuls = **0,0168 %/j**. **Les deux
  < 0,2 %/j ⇒ B-H3 CONFIRMÉE** (régime calme trop calme, risque q̂ = 0).
- **Réserve majeure — profil BIMODAL** : hors régime calme, USDtb a des **rachats institutionnels géants**
  isolés : 2026-07-15 = **275 141 765 USDtb (37,84 %/24 h)**, 2026-07-20 = 100 M (22,03 %), 2026-06-26 = 192 M
  (20,77 %), 2026-08-21 = 70 M (19,57 %). Supply très volatile (736 M → 353 M → 483 M). Ce n'est donc **PAS**
  la dégénérescence msUSD pure (aucun rachat) : c'est un **socle quasi-mort + pics de rachat rares mais
  énormes** — le vrai « msUSD inversé » comme **danger de calibration** (un `q̂` appris sur le socle calme
  serait ≈ 0 et sous-calibrerait la largeur, rendant les pics de 20–38 % extrêmement anormaux).

**VERDICT B-H3 — CONFIRMÉE avec réserve.** Concentration extrême (top-1 97,72 %, top-3 99,76 % ; « ≤ 3 » vrai
en montant, 22 par compte à cause de poussière) et churn calme médian **< 0,2 %/j** (0,0000 %/j ; 0,0168 %/j
jours non nuls) ⇒ **risque q̂ = 0 confirmé** pour le régime calme. Réserve : bimodalité (pics jusqu'à
37,84 %/24 h) — pas de vide de rachat, mais une largeur de calibration sous-estimée sur le socle. Mesure
seulement, aucune calibration.

---

## 4. GHO — B-H4 — décomposition seulement

90 fenêtres UTC quotidiennes (2026-06-20 → 2026-09-17), **toutes `ok`**, C1 vrai partout, 0 `disagree`, 0
`no_quorum`. **Facilitators lus on-chain** (`getFacilitatorsList()` + `getFacilitator(address)`, labels
décodés) — l'architecture a **changé** vs le modèle supposé par l'AUDIT (plus de facilitator « Aave V3 Pool /
aToken » séparé) :
`CoreGhoDirectMinter` `0x5513224d…` (cap 250 M), **`FlashMinter Facilitator` `0xb639d208…` (cap 2 M)**,
`GhoDirectFacilitator GSMs Mainnet` `0xe9ac5231…` (310 M), `LidoGhoDirectMinter` `0x2ce01c87…`,
`HorizonGhoDirectMinter` `0xe10c78a3…`, `GhoDirectFacilitator Plasma/GSM Arbitrum/GSM Monad` (cross-chain).

| Mois | jours | burns (GHO) | mints (GHO) | S_close (GHO) | top brûleur (part) | churn calme méd. %/j | C1 | `disagree` |
|---|---|---|---|---|---|---|---|---|
| 2026-06 | 11 | 162 929 | 162 929 | 599 000 000 | `0xb639d208…` FlashMinter 100 % | 0,0000 (nz 5/11) | 0 | 0 |
| 2026-07 | 31 | 263 242 | 50 263 242 | 649 000 000 | `0xb639d208…` FlashMinter 100 % | 0,0000 (nz 7/31) | 0 | 0 |
| 2026-08 | 31 | 17 931 | 50 017 931 | 699 000 000 | `0xb639d208…` FlashMinter 100 % | 0,0000 (nz 7/31) | 0 | 0 |
| 2026-09 | 17 | 605 244 | 605 244 | 699 000 000 | `0xb639d208…` FlashMinter 100 % | 0,0000 (nz 7/17) | 0 | 0 |

**Décomposition par brûleur (`from`), 90 j** :
| Classe (label facilitator) | GHO brûlés | part |
|---|---|---|
| **FlashMinter Facilitator** (`0xb639d208…`) | 1 049 346,75 | **100,00 %** |
| aTokens / Pool (repay) | 0 | 0 % |
| GSM (USDC/USDT/…) | 0 | 0 % |
| CoreGhoDirectMinter / autres | 0 | 0 % |

- **Total brûlé sur 90 j = 1 049 347 GHO** (~0,15 % d'un supply ~700 M) — négligeable. **100 % d'un seul
  `from`** (le FlashMinter), et **100 % des burns sont mint+burn dans la même tx** (32 aller-retours flash,
  net nul). Jours à ≥ 1 burn : 26/90. Le supply a **crû net** sur la période (599 M → 699 M) avec de gros
  mints mensuels (~50 M en juil./août) **sans burn correspondant** — la **décomposition des mints par
  destinataire n'a pas été mesurée** ici (`byFrom` ne stocke que l'origine des *burns*) ; l'attribution de ces
  mints à un `…DirectMinter` (hausse de bucket) est **[abs]**, non vérifiée dans cette passe.
- Lecture pré-enregistrée B-H4 (« ≥ 70 % des burns viennent des aTokens/Pool (repay) **ou** flash mint+burn ;
  GSM < 20 % ⇒ refus ») : la clause « aTokens/Pool **ou** flash » est vérifiée (**100 % flash**) et **GSM =
  0 % < 20 %**. Mais la **substance** est plus forte que prévu : sous l'architecture DirectMinter actuelle, le
  **désendettement/rachat GHO ne produit AUCUN `Transfer→0x0`** (le GHO remboursé revient au minter, il n'est
  pas brûlé) ; les seuls burns sont du **bruit de flash-loan net-nul**. GHO n'est donc pas une population de
  « file de rachat » — dégénérée pour cette loi.

**VERDICT B-H4 — refus CONFIRMÉ comme population unique** (désendettement ≠ file). Raison mesurée plus forte
que l'hypothèse : 100 % des burns = flash mint+burn net-nul, 0 % repay, 0 % GSM — pas de signal de rachat
on-chain sous l'architecture courante. Décomposition seulement ; aucune calibration.

---

## 5. Fichiers, empreintes, statuts

`docs/census-2026-09-18/data/` (sha256, `\n` normalisé) :
| Fichier | lignes | sha256 |
|---|---|---|
| `B-fdusd-windows.jsonl` | 271 | `693d61c678e299f2599ce415145aafc8622d704837a6444559b336ed4dfcd8fb` |
| `B-susde-windows.jsonl` | 30 | `822de7ebc206edc336764e106a05391c279bcaf6663899852783fd462253a437` |
| `B-susde-cooldown.jsonl` | 1 | `8a58ac3a9be28b4f7521e6425520721348098beb7940f7db672f500a4629699f` |
| `B-gho-windows.jsonl` | 90 | `ad92217de7d45aebd410fbb17f7044ed1e98c156c8404866aed25a2f1131230f` |
| `B-gho-facilitators.jsonl` | 1 | `e0ec39b7bc780662c23eec24e8340ca6a4e9d2ad1705159d74717dce0136dc4f` |
| `B-usdtb-windows.jsonl` | 90 | `83b8284ed0713a70d83a5b8e19df1ffea6d17d6234cfa5866395f1c0c350c1f6` |

**Statuts globaux** : FDUSD 271/271 `ok`, sUSDe 30/30 `ok`, GHO 90/90 `ok`, USDtb 90/90 `ok` — **0 `disagree`,
0 `no_quorum`, 0 échec C1** sur **481 fenêtres**, **+ 0 échec de continuité inter-fenêtres** (476 coutures +
210 comparaisons inter-populations, §0). Chaque enregistrement JSONL porte `status ∈ {ok,disagree,no_quorum,error}`,
`flowProviders`, `supplyProviders`, `byFrom` complet, `topBurners`, `mintBurnSameTx`, `c1_ok`/`c1_diff`,
`v_t_per_hr`, `burns_frac_sopen`.

## 6. Provenance / réserves (zéro dette)

- **Réserve B-H1** : le churn calme **quotidien** médian (0,0000 %/j) est sous le seuil pré-enregistré
  (0,5 %/j) — rapporté sans reframe ; la non-dégénérescence hebdomadaire du scouting n'implique pas la
  version quotidienne. Aucun seuil déplacé.
- **Dette USDtb — RÉSOLUE** : la procurement d'adresse (initialement formée §3) a été résolue par
  l'investisseur le 2026-09-18 (`0xC139190F447e929f090Edeb554D95AbB8b18aC1C`, vérifiée orchestrateur + ce
  worker via `eth_call`) ; B-H3 mesurée et tranchée (§3). Zéro dette restante sur cette population.
- **Fragilité quorum** : le flux archive ne dispose que de **2** fournisseurs (`mevblocker.io`,
  `tenderly.co`) ; si l'un tombe, une fenêtre passerait `no_quorum` (aucune n'est survenue sur cette passe).
  Alternative robuste documentée (non retenue, hors mission RPC-sans-clé) : clé Etherscan V2 ou RPC archive
  payant.
- **Modèle résolu** : `claude-opus-4-8[1m]` (worker épinglé, effort max) ; aucun commit (R-20) ; sortie
  destinée à la vérification adversariale de l'orchestrateur (R-21).
