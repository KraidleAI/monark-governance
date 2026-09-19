# SCOUT sUSDe — StakedUSDeV2 (entrée en file de cooldown) comme candidate 2ᵉ clé Narabi

> **État : section 10/10 + révision advisor appliquée (rapport complet), dernière écriture 2026-09-18T18:31Z.**
>
> Archive de scouting écrite au fil de l'eau (électricité instable — réécriture après chaque section ;
> données intermédiaires append/résumables dans le scratchpad de session ; une coupure a zéroé un JSONL,
> régénéré §8). Worker **`claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` vérifié, effort max), MONARK,
> branche `lot/np-3-reports`. **Lecture seule** : RPC publics sans clé (réutilise
> `scripts/census/burns-by-burner.mjs`, ses providers et son quorum) ; WebFetch/WebSearch pour sources
> primaires. **Aucun commit (R-20)**, aucune calibration committée, aucune phrase publique, aucun seuil
> ajouté après lecture des données présenté comme pré-enregistré. Sortie vérifiable (R-21). Protocole :
> `SCOUT-P-F-7-usde-candidate.md`. Décision investisseur 2026-09-18 : sUSDe d'abord, FDUSD en repli.
>
> Niveaux : **[lu]** = source primaire lue via WebFetch (médiée par un résumeur, non-verbatim garanti) ;
> **[mesuré]** = recomputé on-chain par moi, JSON RPC parsé sans résumeur ; **[2nd]** = seconde main (un
> [2nd] nu sur un chiffre = défaut, doc 03).

## 0. Gate 0 — modèle
Modèle résolu (system-reminder de session) : **`claude-opus-4-8[1m]`**, préfixe `claude-opus-4-8` conforme
(worker épinglé, effort max). Passe autorisée (R-1).

## 0bis. Contexte hérité (memstack + census B, avant extraction web)
- **Census B** (`docs/census-2026-09-18/B-burners.md` §2, worker Opus 4.8, 2026-09-18, [mesuré]) : 30 fenêtres
  sUSDe (2026-08-19 → 09-17), C1 vrai 30/30 ; `cooldownShares` brûle les parts (3/3 tx), `unstake` n'émet
  rien sur sUSDe ; 437 brûleurs distincts, top global 9,08 %. **Ce scouting re-mesure indépendamment (R-21)
  une fenêtre bien plus large (138 fenêtres) et va au-delà** (instrument complet, loi, strates, épisode
  held-out, relation USDe). Le census est **reproduit octet-pour-octet** sur ses 30 jours (§3, §8).
- **Audit d'entrée** (`docs/AUDIT-next-piece-2026-09-18.md` §3/§6) : sUSDe = « 2ᵉ à mesurer, classe distincte
  entrée-de-file, en amont du burn USDe ; jamais poolé » ; « mérite le scouting complet (churn calme, épisode
  2025-10 held-out) avant tout G0 » — exécuté ici.
- **Pré-inscription F2-B USDe** (memstack MONARK uid `610b5a52`, [lu note interne]) : seuils USDe
  pré-enregistrés (référence, **non transposés en douce** à sUSDe) — ρ ≥ 0,30 (actif = burns_raw ≥ 1e21 wei =
  1000 unités), nMin = 50, α = 0,10, garde largeur-nulle, run hors-échantillon 10-15 oct. 2025,
  θ_stress = 1 % S_open, S_floor (USDe/census) = 10 M. **Rappelés à titre de lecture** (§4, §10) ; le
  pré-enregistrement sUSDe viendra au PLAN F2-C.

## 1. Identification de l'instrument (StakedUSDeV2)

- **Adresse** `0x9d39a5de30e57443bff2a8307a4256c8797a3497` (Ethereum mainnet), **Contract Name = "StakedUSDeV2"**,
  Verified Exact Match, compilateur v0.8.19+commit.7dd6d404 [lu, Etherscan 2026-09-18]. **symbol() = "sUSDe",
  decimals() = 18** [mesuré, `eth_call` census ; l'affichage Etherscan `0x12` = 18 en décimal — un résumeur l'a
  lu « 12 », erreur signalée, la lecture on-chain fait foi].
- **Déploiement** : créateur « Ethena: Deployer » `0x8de54b1cefedeab1766b947c7d9a9963436e8fae`, tx
  `0x9b099ba3…e4dda314`, **bloc 18571359** [lu, Etherscan] — **confirmé [mesuré]** : `eth_getCode` vide au bloc
  18571358, code présent au 18571359. (USDe = 18571358 dans le fixture committé : sUSDe est le bloc suivant,
  même lot — recoupement croisé.)
- **Type** : coffre **ERC-4626 non-rebasing** ; valeur par **taux de change** (`convertToAssets`), non par
  rebase : *« staked USDe is burned in exchange for a proportionate USDe amount based on the total amount of
  sUSDe outstanding vis-a-vis total USDe in the smart contract »* [lu, `docs.ethena.fi/technical-design/staking-usde`].
  **Conséquence loi (§2)** : parts brûlées ≠ USDe reçus 1:1.
- **Cooldown + silo** : *« Users must first request their USDe be unstaked wherein their USDe will be placed in
  the USDeSilo smart contract. Once the cooldown period has elapsed, users will be able to withdraw… »* [lu,
  docs]. Silo **`0x7fc7c91d556b400afa565013e3f32055a0713425`** [mesuré, `silo()`].
- **`cooldownDuration()` (dynamique) — [mesuré]** : **courante = 1 jour** (86 400 s, `eth_call` = `0x15180`) ;
  **= 7 jours pendant l'épisode oct. 2025** (604 800 s aux blocs 23529024 [10-08] et 23550517 [10-11]) ;
  `MAX_COOLDOWN_DURATION = 90 jours` [lu + mesuré]. **Historique complet** (événement
  `CooldownDurationUpdated(uint24,uint24)`, topic `0x180eacdf…`, 2 événements sur toute la vie du contrat,
  [mesuré]) : **90 j → 7 j au bloc 18615913** (≈ nov. 2023, juste après le lancement) ; **7 j → 1 j au bloc
  24669809** (≈ mars 2026). **Jamais 0** — donc le contrat n'a jamais basculé en ERC-4626 nu ; la loi
  « file » tient sur toutes les fenêtres mesurées. Le passage 7 j → 1 j est un **moteur mécanique de la dérive
  du churn calme** (§4, §5).
- **V1 vs V2** [lu, code-423n4/2023-10-ethena] : la base **StakedUSDe** (V1) = ERC-4626 + rôles blacklist +
  parts minimales + rewarder, **retrait instantané** (`withdraw`/`redeem`). **StakedUSDeV2** ajoute : mapping
  `cooldowns`, `cooldownDuration`, le **silo** `USDeSilo`, `cooldownAssets`/`cooldownShares` (entrée en file,
  burn des parts *maintenant*), `unstake` (réclamation après `cooldownEnd`), les modificateurs
  `ensureCooldownOn`/`ensureCooldownOff`, `setCooldownDuration`. **Le contrat déployé EST StakedUSDeV2** [lu,
  Etherscan] : pas deux adresses V1→V2 migrées ; le comportement (file vs instantané) est piloté par
  `cooldownDuration`. **Preuve empirique que la garde est active [mesuré]** : `redeem(1,·,·)` et
  `withdraw(1,·,·)` **révoquent avec `OperationNotAllowed()`** (sélecteur `0xf50a3b52`, keccak vérifié) tant que
  durée > 0 ; `cooldownShares(1e24)` révoque avec un **autre** error `ExcessiveRedeemAmount()` (`0x63345388`) —
  la voie file est bien la voie vivante, la voie instantanée est fermée.
- **`cooldownAssets` vs `cooldownShares` — les DEUX brûlent des parts** [lu, source] : les deux appellent
  `_withdraw(msg.sender, address(silo), owner, assets, shares)` → `super._withdraw` (ERC-4626) qui **brûle les
  `shares` de l'owner** → `Transfer(owner → 0x0, shares)`. Discriminant : `cooldownShares` a
  `arg_calldata == shares` ; `cooldownAssets` a `arg_calldata == assets` (≈ shares × taux ≠ shares). Empirique
  [mesuré] : sur un échantillon récent de 50 tx de burn, **38 `cooldownShares` directs, 0 `cooldownAssets`, 12
  médiatisés par routeur** (`0xceda2d85…` ×9, `0x3d7d6fdf…` ×3, tous deux contrats). Le probe cooldown (3 tx)
  confirme 2 `cooldownShares` directs (arg == shares) + 1 routeur, **tous** brûlant sUSDe → 0x0 avec
  `ΔtotalSupply == shares`. **`cooldownAssets` : burn des parts établi [lu, source] mais NON observé on-chain**
  dans l'échantillon (§9, réserve).
- **`unstake` ne brûle rien sur sUSDe** [lu, source : `silo.withdraw(receiver, assets)` sans `_burn`] +
  [mesuré : 641 sorties USDe du silo en 14 j, échantillon de reçu ne touchant aucun log sUSDe]. **Le burn sUSDe
  est à l'ENTRÉE en file, jamais à la sortie.**
- **Blacklist / restricted staker** [lu, source] : rôles `SOFT_RESTRICTED_STAKER_ROLE`,
  `FULL_RESTRICTED_STAKER_ROLE`, `BLACKLIST_MANAGER_ROLE` ; `addToBlacklist/removeFromBlacklist` ;
  `_beforeTokenTransfer` bloque tout transfert depuis/vers une adresse FULL-restricted.
- **Deuxième voie de burn (leçon GHO) — écartée [mesuré]** : `redistributeLockedAmount(from, to)` (admin) fait
  `_burn(from, balanceOf(from))` puis `_mint(to,…)` seulement si `to != 0x0` ; à `to == 0x0` ce serait un burn
  pur contaminant le filtre. **Scan `LockedAmountRedistributed(address,address,uint256)` (topic `0xb8ef21f2…`)
  sur toute la vie du contrat : 2 événements** — blocs 24240865 et 25080186, **tous deux `to =
  0x3b0aaf6e6fcd4a7ceef8c92c32dfea9e64dc1862` (Ethena Dev multisig, ≠ 0x0)** donc net-neutres (récupération de
  fonds blacklistés), et **tous deux HORS des 138 fenêtres mesurées** (blocs dans le trou entre mon dernier
  bloc 2025 = 23600817 et mon premier bloc 2026 = 25347894). **Zéro contamination.** Portée honnête : les **deux voies de burn connues de
  la source d'audit** (`_withdraw`→`super._withdraw` pour la file ; `redistributeLockedAmount` pour la
  redistribution) sont couvertes ; le **bytecode V2 déployé n'ayant pas été relu ligne à ligne (§9.5), aucun
  autre `_burn` n'est *établi*** — « une seule loi sous le topic » est **mesuré pour les voies connues**, non
  prouvé exhaustif.

## 2. Loi de la variable v_sUSDe

**Définition.** Sur une fenêtre UTC de 24 h : **`v_sUSDe(t) = burns_shares(t) / S_open(t) / 24`** — la fraction
horaire du supply de parts qui **entre dans la file de cooldown**. `burns_shares` = Σ des `Transfer(owner→0x0)`
sur le token sUSDe ; `S_open` = `totalSupply()` (parts) à l'ouverture. Numérateur et dénominateur **tous deux
en parts** → ratio **invariant au taux de change** (une fraction du stake, pas un montant USDe). Même forme
fonctionnelle que `v_t` USDe, mais le « burn » est ici une **demande de dé-staking mise en file**, pas un
rachat au pair.

**Justification / rejet Diamond–Dybvig.** Le cooldown est une **file d'attente de sortie à service séquentiel
différé** (requête → attente `cooldownDuration` → réclamation) : primitive canonique du *bank run* (D–D 1983).
**Deux écarts assumés, non cachés** :
1. **Sortie au NAV, pas au pair.** La conversion parts → USDe suit `convertToAssets` (taux croissant), non 1:1.
   **Aucun avantage de premier-arrivé sur les parts** (deux sortants le même jour reçoivent le même taux — pas
   de payoff séquentiel D–D sur sUSDe). Le cooldown est un **délai** de style D–D qui rend l'intention de sortie
   **observable on-chain**, pas une redemption au pair. Le motif de run n'est pas le rang sur sUSDe, mais la
   **peur sur la valeur de l'USDe** sous-jacent.
2. **File contournable.** Un détenteur pressé **vend sUSDe sur DEX/CEX** au lieu de la mettre en file. `v_sUSDe`
   capte donc l'**intention de sortie patiente** et **sous-réagit en panique aiguë** — confirmé empiriquement
   (§5 : le pic de file oct.-2025 = 1,87 %/j vs 11,16 %/j de burn USDe le même jour).

**Ce que ça mesure** : le débit auquel une position stakée est engagée à quitter le pool porteur de rendement
(l'entrée en file brûle la part *maintenant* ; la position sort du rendement dès la requête). Une **demande de
dé-staking**.

**Ce que ça NE mesure PAS** : (a) les **mints de parts** = staking entrant (colonne `mints`, rapportée pour
contexte, jamais nette) ; (b) la **magnitude en USDe** (parts × taux ≠ USDe) ; (c) la **sortie secondaire**
(ventes DEX/CEX contournant la file) ; (d) le **rachat USDe aval** (burn EthenaMinting, événement ultérieur —
objet de §7, pas de v_sUSDe).

**Loi retenue** : v_sUSDe = **intention de sortie de la file de staking**, classe **distincte** de la loi de
rachat USDe (jamais poolée — audit §3). D–D **partiellement** applicable : délai/file oui, payoff séquentiel au
pair non.

## 3. Identité C1 pour ce token — [mesuré, 138/138]

C1 par fenêtre = `S_open == S_close + burns − mints` sur le `totalSupply()` des **parts** (le supply croît des
mints de staking, décroît des burns d'entrée-de-file). Recomputée par le script réutilisé sur **138 fenêtres**
(2025-09-01 → 2025-10-17 : 47 j ; 2026-06-19 → 2026-09-17 : 91 j) : **138/138 `c1_ok`, 0 échec, 0 `disagree`,
0 `no_quorum`.** Quorum **flux** (burns/mints/byFrom) = **2 fournisseurs distincts `mevblocker.io` +
`tenderly.co`** (`providerOf`, octets identiques ou `disagree`) ; **supply** = `drpc.org` + `blastapi.io` —
deux paires disjointes reliées par l'identité arithmétique. **≥ 10 fenêtres exigées → 138 fournies.**

**Intégrité croisée [mesuré]** : (a) **census reproduit** — mes 30 jours 2026-08-19→09-17 sont
**octet-pour-octet identiques** au JSONL du census B (`burns`, `mints`, `supplyOpen`, `supplyClose`) : 30/30 ;
(b) **bornes de bloc** — sur les 45 jours communs avec le fixture USDe committé, mes `fromBlock`/`toBlock`
(résolus indépendamment) sont **identiques** au fixture : 0 écart / 45 (la propriété « sentinelle » — bornes
byte-identiques par processus indépendants — démontrée, pas postulée).

## 4. Churn calme — 91 fenêtres UTC (2026-06-19 → 2026-09-17), [mesuré]

**Régime : 1-jour de cooldown** (changé de 7 j au bloc 24669809 ≈ mars 2026). Métriques (v en fraction 24 h du
supply de parts, `burns/S_open`) :

| Métrique | Valeur |
|---|---|
| Fenêtres | 91 (toutes `ok`, C1 vrai) |
| **Fenêtres à burns = 0** | **0 / 91** (churn quotidien réel, jamais nul) |
| **ρ (actif = burns ≥ 1000 unités)** | **1,000** (91/91) — **non discriminant ici** |
| v médiane | **0,590 %/j** (q25 0,338 % ; q75 1,170 % ; q90 1,557 % ; **max 4,397 %**) |
| v/h médiane | 2,46e-4 (q90 6,49e-4 ; max 1,83e-3) |
| **mint+burn même tx** | **0** (staking entrant et sortie-de-file ne coexistent jamais dans une tx) |
| Total brûlé (parts) | ≈ 902,2 M sUSDe |

**Concentration — population DISPERSÉE [mesuré]** : **1 075 brûleurs distincts** sur 91 j ; **top-1 = 8,92 %**,
top-3 = 20,24 %, top-10 = 39,01 %, **HHI = 0,0247** (très bas). L'inverse structurel de FDUSD (brûleur unique
100 %) ou USDtb (top-1 97,7 %). **Ce ne sont donc PAS « 3 gros » : c'est une longue traîne de dé-staking.**
`eth_getCode` sur le top-10 [mesuré] : **5 EOA + 5 contrats** ; le top-1 (`0x9ffe7714…`) est un **contrat**
(routeur ou coffre — `cooldownShares` prend `msg.sender` comme owner, donc un routeur agrégerait plusieurs
usagers derrière une adresse, ce qui rendrait la dispersion réelle **encore plus grande**, jamais moindre).
**Verdict concentration : 437/1 075 dispersés, confirmé — pas 3 gros.**

**Réserve non-stationnarité + pré-enregistrement** : ce churn calme 2026 est maintenant **connu** (comme pour
USDe) — tout ρ/q̂/θ fixé après l'avoir vu serait biaisé. À réserver à une fenêtre **fraîche non vue** au PLAN
F2-C. ρ = 1,0 rend le garde-fou ρ_min USDe **inopérant** ici (le vrai risque n'est pas « pas de rachats » comme
msUSD, mais la **largeur** et la **confusion run/whale** — §5).

## 5. Épisode held-out 2025-10-08 → 10-17 — [mesuré] (cooldown = 7 jours à l'époque)

| Jour UTC | régime | v (%/j) | v/h | burns (parts) | brûleurs distincts | top-1 |
|---|---|---|---|---|---|---|
| 2025-10-08 | calm | 0,622 | 2,59e-4 | 30,4 M | 34 | 74,4 % |
| 2025-10-09 | calm | 0,327 | 1,36e-4 | 16,0 M | 58 | 23,5 % |
| 2025-10-10 | holdout | 0,439 | 1,83e-4 | 21,4 M | 36 | 38,9 % |
| **2025-10-11 (pic)** | **holdout** | **1,872** | **7,80e-4** | **91,4 M** | **112** | **9,1 %** |
| 2025-10-12 | holdout | 0,842 | 3,51e-4 | 40,5 M | 70 | 21,3 % |
| 2025-10-13 | holdout | 0,511 | 2,13e-4 | 24,4 M | 40 | 94,3 % |
| 2025-10-14 | holdout | 0,170 | 7,09e-5 | 8,1 M | 46 | 35,9 % |
| 2025-10-15 | holdout | 0,218 | 9,10e-5 | 10,4 M | 35 | 64,0 % |
| 2025-10-16 | calm | 0,813 | 3,39e-4 | 38,8 M | 90 | 34,9 % |
| 2025-10-17 | calm | 1,417 | 5,91e-4 | 67,3 M | 81 | 28,4 % |

**Le pic est le 11 octobre 2025** (comme USDe) : v = **1,872 %/j**, S_open ≈ 4,88 Md parts, **112 brûleurs
distincts, top-1 seulement 9,1 %** = un dé-staking **à large base** (un vrai mouvement corrélé, pas un whale).
La traîne reste élevée (16-17 oct. à 0,8-1,4 %/j) — cohérent avec un cooldown de 7 j (les entrées continuent
tant que le stress dure).

**Séparation en × (dénominateur explicite)** :
- vs **médiane calme contemporaine (baseline 2025-09-01→10-07, 37 j)** = 0,043 %/j → **× 43,2** (pic/médiane).
- vs **médiane calme 2026 (régime 1-jour)** = 0,590 %/j → **× 3,17**.
- ⚠ Le baseline 2025 lui-même contient **deux jours calmes > pic du run** — 2025-10-01 (2,99 %, top-1 97,4 % =
  whale) et **2025-09-25 (2,95 %, 244 brûleurs = large base)** — donc le × 43 porté par la *médiane* masque que
  le *max* du baseline **dépasse déjà le run** (voir la table de rang ci-dessous et §10).

**Fait décisif, rapporté en observation témoin (JAMAIS « aurait alerté »)** : classé sur **v**, le pic du run
(10-11) est le **10ᵉ jour sur 138** — **9 jours calmes ont un v supérieur** :

| rang | jour | régime | v (%/j) | brûleurs | top-1 | nature |
|---|---|---|---|---|---|---|
| 1 | 2026-07-23 | calm | 4,397 | 35 | 89,9 % | whale |
| 2 | 2026-08-12 | calm | 4,022 | 31 | 61,0 % | whale |
| 3 | 2026-07-09 | calm | 3,528 | 52 | 67,0 % | whale |
| 4 | 2025-10-01 | calm | 2,986 | 30 | 97,4 % | whale |
| **5** | **2025-09-25** | **calm** | **2,953** | **244** | **7,4 %** | **large base** |
| … | … | | | | | |
| **10** | **2025-10-11** | **holdout (run)** | **1,872** | **112** | **9,1 %** | **large base** |

La **breadth** (nombre de brûleurs, part du top-1) distingue *partiellement* : le run est large (112, 9 %) et la
plupart des jours calmes au-dessus sont des **whales** (top-1 61-97 %). **MAIS `2025-09-25` (calme, 2 sem. avant
le krach) est à la fois plus large (244 brûleurs, top-1 7,4 %) ET plus haut (2,95 %) que le run** — donc **même
`v` + breadth ne séparent pas proprement l'épisode systémique** du bruit de rotation. (Cause du 2025-09-25 non
identifiée — §9.) De plus, le pic du run (1,87 %/j) est **inférieur au max du calme 2026** (4,40 %/j) : la
non-stationnarité (churn ×13 entre 2025-09 et 2026, en partie via le passage cooldown 7 j → 1 j) fait que le
calme récent **enveloppe** la magnitude du pire stress historique.

## 6. Strates calendaires — [mesuré, sur le calme 2026]

- **Week-end vs semaine** : médiane v/h **week-end 1,54e-4 vs semaine 2,62e-4** (semaine ≈ **× 1,7**). Par jour
  (médiane v/h) : Jeu 3,45e-4 > Ven 2,89e-4 > Lun 2,62e-4 > Mer 2,17e-4 > Mar 1,83e-4 > Sam 1,57e-4 > Dim
  1,51e-4. **Il y a une strate hebdomadaire jour-ouvré > week-end** (dé-staking à gestion active), à
  pré-enregistrer si la fenêtre de décision est infra-hebdomadaire.
- **Périodicité liée au cooldown ?** Autocorrélation de la série quotidienne de v (calme 2026 contigu) :
  **lag-7 = −0,03** (≈ 0), lag-1 = 0,13, lag-14 = 0,20. **Le cooldown (7 j puis 1 j) n'induit AUCUNE périodicité
  à 7 jours dans les ENTRÉES** : les entrées sont pilotées par la demande de sortie, pas par un cycle de durée
  de cooldown (le burn est à l'entrée, la durée ne fait que retarder la *sortie* du silo, non mesurée par v).
  Le seul motif calendaire est jour-ouvré/week-end, pas un écho du cooldown.

## 7. Relation à USDe — [mesuré]

Jours communs avec le fixture USDe committé (`fixtures/usde-calib-series.json`, qui finit le **2025-10-15**) :
**45 jours** (2025-09-01 → 2025-10-15 ; les 91 jours calmes 2026 n'ont **aucun** homologue USDe committé).

- **Corrélation de rang (Spearman) `v_sUSDe(t)` vs `v_USDe(t)`** : **0,573** sur les 45 jours communs ; **0,571**
  sur les 8 jours du run (10-08→10-15). Co-mouvement modéré positif (les deux réagissent aux mêmes conditions
  de marché), du même ordre que le Spearman A-H2 sur jours actifs (0,48, audit).
- **Entrée en file précède-t-elle le burn USDe ? — NON, sur le timeline disponible.** Lead-lag Spearman
  `v_sUSDe(t)` vs `v_USDe(t+k)`, k = 0..7 : **lag-0 = 0,573 (max), puis décroît** (lag-1 0,28, lag-2 0,43,
  lag-3 0,20, … lag-6 −0,12, lag-7 0,12). Le maximum est à **lag 0** (co-mouvement contemporain), **aucune
  avance de la file sur le burn**. **Limite mécanique explicite** : sous cooldown 7 j (valeur à l'époque,
  §1), l'USDe libéré par une entrée-en-file du 10-11 ne sort du silo (et n'est donc rachetable→burn) que vers
  le **17-18 oct.**, **après la fin du fixture USDe (10-15)** — la **précédence est donc non-décidable dans le
  timeline commun** ; la corrélation à lag 0 est du **co-choc**, pas de la précédence. Fait, pas inférence. **Sens inverse (USDe →
  sUSDe : un choc de prix/rachat entraînant des sorties de staking ultérieures) NON testé** ; à lag 0 dominant
  il est peu probable qu'il révèle une avance, mais ce n'est pas mesuré.
- **Intégrité** : bornes de bloc identiques au fixture USDe sur 45/45 jours (§3).

## 8. Hostilité RPC / budget — [mesuré]

- **Flux archive `eth_getLogs` sans clé : 2 fournisseurs distincts seulement** — `rpc.mevblocker.io` +
  `gateway.tenderly.co`/`mainnet.gateway.tenderly.co` (`providerOf` = `tenderly.co`, un seul). **Supply
  archive `eth_call`** : `eth.drpc.org` + `eth-mainnet.public.blastapi.io` (+ `eth-pokt.nodies.app`,
  tenderly, mevblocker en secours). **En-têtes de bloc** : drpc/blastapi/tenderly/pokt. Endpoints fermés
  (hérités du census, non re-sondés) : publicnode 403, llamarpc DNS, ankr clé, drpc/blastapi 400 sur getLogs,
  flashbots faux-silencieux. Matrice inchangée depuis le census 2026-09-18.
- **Coût en appels [mesuré]** : pull des 138 fenêtres = **1 273** ; probe instrument (déploiement,
  cooldownDuration + historique, gate, recensement sélecteurs) = **211** ; probe complémentaire (gate 429-safe,
  `getCode` top-10, décodage redistribution) = **18**. **Total ≈ 1 502 appels réseau** — **cap mission ≤ 4 000
  non dépassé** (marge 2 498). **0 `disagree`, 0 `no_quorum` sur 138 fenêtres.**
- **Fragilité** : le flux archive ne tient qu'à **2** fournisseurs ; si l'un tombe, une fenêtre passe
  `no_quorum` (aucune sur cette passe). Alternative robuste (hors mission RPC-sans-clé) : clé Etherscan V2 /
  archive payant.
- **Incident électricité** : une coupure a **zéroé le JSONL de fenêtres** (88 Ko de blancs, 0 newline —
  artefact FS classique) ; détecté, régénéré intégralement (les 30 jours communs au census sont ressortis
  byte-identiques, §3 — preuve que la régénération est fidèle). Le probe cooldown, lui, avait survécu.

## 9. NON TROUVÉ / réserves / procurement

1. **`cooldownAssets` on-chain** : burn des parts **établi [lu, source]** (via `_withdraw`), mais **non observé
   [mesuré]** dans l'échantillon de 50 tx (38 `cooldownShares`, 0 `cooldownAssets`, 12 routeurs). La voie
   existe et brûle des parts par le code ; elle est simplement peu empruntée en direct. Réserve, pas dette.
2. **Cause du 2025-09-25** (calme, 244 brûleurs, top-1 7,4 %, v = 2,95 %/j — plus « run-like » que le run par v
   ET breadth) : **non identifiée** (fin d'epoch de points ? rotation de rendement ? migration ?). Analogue de
   « l'anomalie du 1er mars » du scout USDe. NON TROUVÉ. **Branche décisionnelle** : si **stress** (peur
   antérieure) → le garde-fou breadth (§10.2) **tient** ; si **rotation** (bénigne) → il **échoue**. Une
   WebSearch (Ethena/USDe 24-25 sept. 2025) n'a **trouvé aucun événement de stress documenté** (seul le krach
   du 11 oct. l'est) → l'hypothèse **rotation/bénigne** est la plus probable, ce qui **affaiblit** le garde-fou
   breadth et soutient le verdict prudent §10. À confirmer par l'orchestrateur avant de traiter « même la
   breadth échoue » comme tranché.
3. **Nature des contrats du top-10** (5 sur 10) : `getCode` établit contrat vs EOA, mais **routeur-agrégateur
   vs coffre-mono-entité non tranché** (labels non lus). N'affecte pas le verdict de dispersion (top-1 9 %),
   affecte l'interprétation fine de la breadth.
4. **`maxRedeemPerBlock` / plafonds** : sans objet pour sUSDe (le cooldown n'a pas de plafond par bloc
   documenté comme EthenaMinting) — non applicable.
5. **Niveau de preuve à deux vitesses** (comme le scout USDe) : les verbatims docs/Etherscan/source passent par
   un résumeur WebFetch ([lu], non-verbatim garanti) ; **le bytecode V2 déployé n'a pas été relu ligne à ligne**
   (seul le dépôt d'audit code-423n4, base V1 + V2, l'a été [lu]). Les nombres RPC (getLogs/call/getCode/tx) sont
   parsés par moi sans résumeur = seul [mesuré] non médié.
6. **Procurement — AUCUNE dette formée** : les docs Ethena, en 404 sur l'ancien chemin `solution-design/…`,
   ont été **résolus** sur `technical-design/staking-usde` [lu] ; la durée numérique du cooldown (absente des
   docs) a été **obtenue on-chain [mesuré]**, meilleure ; le diff V1/V2 vient de la source d'audit [lu].
   **Aucun document manquant → aucune demande de procurement.** (Les réserves 1-3 sont des mesures
   complémentaires bon marché, pas des documents introuvables.)

## 10. Recommandation

**Verdict : candidate à RETENIR pour le CHURN, mais le volet RUN est À MESURER DAVANTAGE — conditionnelle,
pas committable en l'état.**

- **Ce qui est solide (mieux que msUSD, mieux que FDUSD/USDtb sur le churn)** :
  - **Mécanisme propre**, [lu]+[mesuré] : `cooldownShares`/`cooldownAssets` brûlent les parts à l'entrée en
    file, `unstake` ne brûle rien, garde `ensureCooldownOff` active (`OperationNotAllowed` mesuré), une seule
    loi sous le topic (redistribution hors fenêtres, 0 contamination), silo vérifié.
  - **C1 138/138**, census reproduit byte-identique 30/30, bornes byte-identiques au fixture USDe 45/45.
  - **Churn calme NON-DÉGÉNÉRÉ et riche** : 0 jour à burns nuls sur 91, médiane 0,59 %/j, ρ = 1,0, **1 075
    brûleurs dispersés** (top-1 9 %, HHI 0,025). C'est **exactement la propriété que msUSD n'avait pas** (1
    burn de 1 token sur 192 j). **C'est le meilleur dossier de churn des populations scoutées.**
- **Ce qui bloque un commit (le volet run)** — **chiffre qui décide** : classé sur `v`, le **pic du run
  held-out (2025-10-11) est le 10ᵉ jour sur 138 ; 9 jours calmes ont un v supérieur** ; la séparation
  pic/médiane calme n'est **× 3,17 que contre le régime 2026** (× 43 seulement contre la médiane 2025-09, mais
  ce baseline a lui-même un jour à 2,99 % > pic) ; et **`2025-09-25` (calme) est plus large ET plus haut que le
  run**. Donc **`v_sUSDe` seul — même augmenté de la breadth — ne fait pas ressortir l'épisode systémique** du
  bruit de rotation/whale. Causes structurelles mesurées : file **contournable** (les pressés vendent sUSDe) +
  sortie **au NAV** (pas de course au pair) ⇒ le pic de file oct.-2025 (1,87 %/j) est ~6× **sous** le burn USDe
  du même jour (11,16 %/j, [2nd, scout USDe/census — mesuré par eux]) ; et **non-stationnarité sévère** (churn
  ×13 en un an, piloté en partie par cooldown 7 j → 1 j). Pour mémoire, la séparation run/calme des autres
  candidats [2nd, mesuré par docs internes] : USDe ~10⁴× (run 11,16 %/j vs calme ≈ 0) ; FDUSD 2,3-6,4× (run
  8,32 %/24 h) ; sUSDe est **le plus faible sur le critère « le run est-il le plus grand `v` du corpus »** —
  critère où sUSDe seul échoue (rang 10/138) ; les × des précédents sont **[2nd, mesurés par leurs scouts
  respectifs, pas par moi]**.
- **Relation USDe** : co-mouvement (Spearman 0,57), **pas de précédence** (lag-0 max ; précédence non-décidable
  car cooldown 7 j pousse la sortie USDe au-delà de la fin du fixture). L'idée « la file en amont annonce le
  burn USDe » **n'est pas soutenue** par les données disponibles — à rouvrir seulement avec un fixture USDe
  prolongé au-delà du 15 oct. 2025.

**Décision proposée à l'orchestrateur** : **sUSDe = population de churn calibrable (résout le défaut fondateur
msUSD) mais dont la loi `stable-run-velocity-24h` sur `v` seul est un détecteur de run FAIBLE pour cet
instrument.** Ne PAS committer une calibration `v`-seul. **À mesurer davantage avant un PLAN F2-C** :

**Seuils/décisions à PRÉ-ENREGISTRER dans un futur PLAN F2-C (lectures, non pré-enregistrées ici)** :
1. **Régime de cooldown** : calibrer **dans un seul régime** (post-2026-03 = 1 jour) ; le calme 2026 étant
   maintenant **vu**, tirer ρ/q̂/θ sur une **fenêtre calme fraîche non vue** (hygiène de pré-enregistrement).
2. **Co-variable de breadth OBLIGATOIRE** : un « run » exige `v` élevé **ET** un nombre minimal de brûleurs
   distincts (le run 10-11 = 112 ; les whales calmes = 30-52) — à fixer AVANT le pull ; sans elle, `v` seul
   confond run et whale. (Réserve : `2025-09-25` montre que même ce garde-fou n'est pas suffisant seul.)
3. **θ_stress** : 1 % S_open (USDe) est **trop bas** ici (q90 calme = 1,56 % ⇒ ~10 % de jours calmes
   « stress ») ; le fixer sur un quantile haut du calme frais (q99), pas sur la valeur USDe.
4. **ρ_min** : **inopérant** (ρ = 1,0) — remplacer le garde-fou de dégénérescence par une **garde de largeur**
   (`q̂ > 0`, lo ≠ hi ⇒ `under_calib`) et la garde de breadth (2).
5. **S_floor** : le supply de parts (≈ 1,05 Md en 2026, ≈ 4,9 Md en oct. 2025) satisfait trivialement 10 M ;
   S_floor non-contraignant — le proposer explicitement ou l'abandonner.
6. **nMin = 50, α = 0,10** (comme USDe) ; **held-out = 2025-10-11**, testé **dans son régime contemporain**
   (calibrer 2025-09, pas 2026) ; rétrospective écrite en **observation témoin**, jamais « aurait alerté ».
7. **Repli** : si le volet run reste non-séparable après ces mesures, **FDUSD** (décision investisseur
   2026-09-18 : repli) garde le meilleur run reconstruit (8,32 %/24 h) au prix d'un churn en rafales — arbitrage
   à trancher par l'orchestrateur/investisseur.

## Annexe — journal des URL, empreintes, fenêtres

**Sources primaires (WebFetch, fetch direct)** :
- `docs.ethena.fi/technical-design/staking-usde` — cooldown + silo + ERC-4626 non-rebasing [lu]. (Ancien chemin
  `solution-design/staking-usde` → 404, corrigé.)
- `raw.githubusercontent.com/code-423n4/2023-10-ethena/main/contracts/StakedUSDeV2.sol` —
  `cooldownAssets/Shares`, `unstake`, `setCooldownDuration`, `ensureCooldownOff`, `MAX_COOLDOWN_DURATION`,
  constructeur/silo [lu].
- `raw.githubusercontent.com/code-423n4/2023-10-ethena/main/contracts/StakedUSDe.sol` — `_withdraw`,
  `redistributeLockedAmount`, rôles blacklist, `_beforeTokenTransfer` [lu].
- `etherscan.io/address/0x9d39a5de…` — Contract Name StakedUSDeV2, créateur/bloc de déploiement [lu].
- memstack MONARK uid `610b5a52` (seuils F2-B USDe), `docs/census-2026-09-18/B-burners.md` §2, `docs/AUDIT-next-piece-2026-09-18.md` §3/§6.

**RPC [mesuré]** : `mevblocker.io` + `tenderly.co` (flux getLogs) ; `drpc.org` + `blastapi.io` (supply
`eth_call`) ; drpc/blastapi/tenderly/pokt (en-têtes). ≈ 1 502 appels, 0 désaccord de quorum.

**Empreintes des artefacts de scratchpad (hors dépôt, régénérables)** :
- `B-susde-windows.jsonl` (138 fenêtres) sha256 `6fa8d75a10f5d3c45f2e0365ef228aa4d4221a36c2e7fad470613443aea1a6f2`
- `susde-instrument.json` sha256 `1001b49f5b226944bbbebed9ba820d620804d87422f1f5e376118f0ad85edcfc`
- `probe2.json` sha256 `84bc92fa37421d785df55915465c2c80d09780f709eabc1a023f8eed66a9b995`
- `analysis.json` sha256 `9820cfd7439e1cf67ddb196c9933b9377ed3fa0fe0dbd0a02a3f7adc8d632caf`

**Sélecteurs/topics [mesuré, keccak auto-validé]** : `cooldownDuration()` `0x35269315`, `cooldownShares(uint256)`
`0x9343d9e1`, `cooldownAssets(uint256)` `0xcdac52ed`, `redeem(uint256,address,address)` `0xba087652`,
`withdraw(uint256,address,address)` `0xb460af94`, `silo()` `0xeb3beb29` ;
`CooldownDurationUpdated(uint24,uint24)` `0x180eacdf…`, `LockedAmountRedistributed(address,address,uint256)`
`0xb8ef21f2…` ; errors `OperationNotAllowed()` `0xf50a3b52`, `ExcessiveRedeemAmount()` `0x63345388`.
