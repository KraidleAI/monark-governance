MODELE RESOLU: claude-sonnet-5

# L — Lecture intégrale : LlamaRisk et al., « rsETH Incident Report (April 20, 2026) »

- **Chercheur** : `claude-sonnet-5`, effort max, 2026-09-20. Mission : clôture du procurement « rapports risque DeFi » (item 6.c #1 de `PROCUREMENTS-2026-09-20.md`), le plus volumineux des quatre threads assignés.
- **Méthode** : API JSON publique Discourse. Fetch initial (`/t/24580.json`, 20/173 posts du stream, `posts_count` affiché 172) puis pagination par lots de 20 (`/t/24580/posts.json?post_ids[]=...`, 8 lots) pour les 153 posts restants. `curl`, lecture seule, ≥ 1 s entre requêtes, **aucun 429 rencontré sur les 9 requêtes**. Aucun scraping HTML forcé. Aucun appel à l'outil advisor intégré pendant l'extraction.
- **Usage prévu (ADR-M020)** : PR-UK-10 (« répartition des pertes », rattaché à D6/fact 8) ; complète `L-lecture-messari-aave-cracks-2026-04-22.md` §3 ; canal « gap discret / pool fini » (Gatto Table 9) évoqué pour U-5 ; e-mode ETH/LST — rsETH est un des trois actifs LST cités en fact 6 d'ADR-M020 (« wstETH/weETH/rsETH : descriptions inchangées depuis 2025-01-14, ETH-dénominées, taux plafonné × ETH/USD »).

## 0. Gate 0
Modèle résolu déclaré ligne 1 : `claude-sonnet-5`. Préfixe conforme. Poursuite autorisée.

## Identification (avant extraction)

- **Titre exact** : « rsETH Incident Report (April 20, 2026) ».
- **Thread id** : 24580. **Slug vérifié dans le JSON** : `rseth-incident-report-april-20-2026`.
- **URL canonique** : `https://governance.aave.com/t/rseth-incident-report-april-20-2026/24580`. Résout le NON TROUVÉ #7 de `PROCUREMENTS-2026-09-20.md` pour ce thread.
- **Auteur post #1** : `LlamaRisk` (co-écrit « by Aave service providers acting within their respective mandates »). Posts #41, #65, #158 également `LlamaRisk` (mises à jour officielles successives). Post #173 : `AaveLabs`.
- **Dates** : créé 2026-04-20T20:12:55.763Z ; dernier post 2026-05-05T16:30:29.834Z ; clôture automatique système 2026-06-04T16:30:52.561Z.
- **Catégorie** : `category_id` 4 = « Governance ».
- **Nombre de posts** : **`posts_count` affiché = 172, `stream` réel = 173 ids.** Écart expliqué avec certitude (élément résolu cette passe, **corrige un point laissé non résolu dans `ETUDE-APIFY-2026-09-20.md` §1(d)**, qui notait « écart mineur non résolu ») : le 173ᵉ id du stream (id 64322, `post_number` 181) est un **message système automatique** (`username: "system"`, `post_type: 3`, `action_code: "autoclosed.enabled"`, texte : « This topic was automatically closed 30 days after the last reply »), **non compté** dans `posts_count` par Discourse. **173/173 posts du stream lus intégralement**, y compris ce message système.
- **Classe** : P1 (rapport co-écrit par les service providers mandatés d'Aave, forum de gouvernance officiel).
- **Participants** : 76. **Vues** : 33 511. **Likes** : 370 — thread le plus engagé des quatre lus cette passe, de loin.

## Archive brute et sha256

| Fichier | sha256 |
|---|---|
| `recus\aave-discourse\aave-rseth-incident-report-24580-p1.json` (brut, page 1, 20/173) | `3f10dd6b471fc16afc8a032af9896371869a037f13e525d103d4002c2ae71c2b` |
| `...-batch-01.json` à `...-batch-08.json` (8 lots, 153 posts) | `1415f8b2...c1`, `0695caf4...28`, `fc6f1970...8d`, `5a7de827...08`, `719bfc33...52`, `300fca55...56`, `d0191919e838f0...12`, `8b9b4b25...c1` (table complète dans `SOURCES-sha256-aave-discourse.txt`) |
| `recus\aave-discourse\aave-rseth-incident-report-24580-FULL-merged.json` (173/173 fusionnés) | `a5866dd2c98a65576bf9af8267ce560e2f98055f6a979282243d9e9b63496e48` |
| `recus\aave-discourse\aave-rseth-incident-report-24580-FULL-digest.txt` (texte nettoyé, lu intégralement, 3775 lignes) | `4f054e4fb430a15e6e5a29fa84fb252f59ebc0f0543686344a20ab089cf2c9d1` |

Table complète des 8 sha256 de lots : voir `F:\PRODUITS\etude-2026-09-20\procurements\recus\aave-discourse\SOURCES-sha256-aave-discourse.txt`.

## Post #1 (LlamaRisk et al., 2026-04-20T20:12:55Z) — [lu] intégral — le rapport lui-même

### 1. Mécanisme de l'exploit (mesuré, on-chain)

Verbatim (≤ 25 mots) : « On 2026-04-18 at 17:35 UTC (Ethereum block 24,908,285), an attacker exploited Kelp's LayerZero V2 Unichain to Ethereum rsETH route, which was configured as a 1-of-1 DVN. »

- Route Unichain→Ethereum configurée en **1-of-1 DVN** (Decentralized Verifier Network) — un seul vérificateur, aucun redondant.
- Paquet entrant forgé (nonce 308), vérifié par la seule attestation DVN, **sans burn côté source** correspondant (nonce sortant Unichain resté à 307).
- **116 500 rsETH** libérés depuis l'adaptateur `RSETH_OFTAdapter` (`0x85d456b2dff1fd8245387c0bfb64dfb700e98ef3`) vers l'attaquant.
- Solde de l'adaptateur : **116 723 rsETH** (1 bloc avant) → **223 rsETH** (immédiatement après).
- Un second paquet forgé (nonce 309, 40 000 rsETH additionnels) a **reverté** — Kelp avait déjà gelé l'adresse destinataire, récupérant **40 373 rsETH** via `FrozenFundsRecover`. Solde adaptateur résiduel confirmé : **40 373 rsETH**.
- **Total des créances L2 (« remote claims ») contre cet adaptateur : 152 577 rsETH** — ceci **n'est pas** le montant volé (116 500) mais le cumul de toutes les créances L2 préexistantes + la part volée. Ratio de couverture résiduel L2 : **40 373 / 152 577 = 26,46 %**.
- Attaquant : 7 adresses actives sur Aave, health factor stabilisé **1,01–1,03**. Sur les 116 500 rsETH reçus, **89 567 rsETH (221,39 M$)** déposés sur Aave (Ethereum Core + Arbitrum), empruntant **82 650 WETH (190,86 M$) + 821 wstETH (2,33 M$)**. Table nominative des 7 adresses fournie dans le post (montants par adresse, non reproduits ici — voir digest.txt).

### 2. Actions défensives (chronologie mesurée, verbatim des heures)

| Heure (UTC) | Action |
|---|---|
| ~19:00, 18 avril | Gel LTV=0 rsETH/wrsETH sur 11 marchés (Core, Prime, Arbitrum, Avalanche, Base, Ink, Linea, Mantle, MegaETH, Plasma, zkSync) |
| ~14:30, 19 avril | Ajustement IRM WETH hors-Core (Arbitrum/Base/Mantle/Linea) : Slope2 → 1,50 %, taux à 100 % util. 8,5-10,5 %→3,0 % APR |
| ~02:00, 20 avril | Gel WETH sur Core/Prime/Arbitrum/Base/Mantle/Linea |
| ~05:00, 20 avril | Ajustement IRM WETH Core : Slope1=2 %, Slope2=3 %, util. optimale=94 % |

Position officielle : « Aave's smart contracts were not compromised at any point during this event. » — cause externe (bridge), pas un bug protocole.

### 3. Scénarios de bad debt (proposition/modèle, PAS un fait réalisé — le texte le dit explicitement : « hypothetical... for analytical purposes only »)

Périmètre : 23 marchés Aave V3 / 20 chaînes ; 11 listent rsETH/wrsETH (tous gelés) ; modèle de bad debt couvre 7 (Arbitrum, Avalanche, Base, Ethereum Core, Ink [marque blanche Tydro], Linea, Mantle) ; 4 ont un solde négligeable (Ethereum Lido, MegaETH, Plasma, zkSync) ; 12 ne listent pas rsETH du tout.

**Scénario 1 — socialisation uniforme.** Depeg = unbacked / (offre originale + unbacked) = 112 204 / (629 689 + 112 204) = **15,12 %** (chaque rsETH, toute chaîne, retient 84,89 % de sa valeur oracle). 119 positions simulées. **Bad debt total : 123 708 727 $** (WETH 51 927,30 tokens/120,39 M$ ; wstETH 1 161,08/3,32 M$). Par chaîne : Ethereum Core 91,79 M$ (39 571,09 WETH, shortfall 1,54 % — absolu le plus grand, relatif faible) ; Mantle 10,38 M$ (shortfall **9,54 %**, le plus fort relatif) ; Arbitrum 10,30 M$ (3,11 %) ; Base 6,12 M$ (3,00 %) ; Ethereum wstETH 3,07 M$ (0,10 %) ; Ink 1,72 M$ (2,23 %) ; Arbitrum wstETH 0,25 M$ (0,44 %) ; Linea 0,08 M$ (0,24 %) ; Avalanche/Base wstETH négligeables. Module Umbrella WETH Core cité : 23 507,63 WETH (54,06 M$), pourrait compenser une partie.

**Scénario 2 — pertes isolées aux L2.** Mainnet rsETH pleinement backé (dépôts de staking Kelp, indépendants de l'adaptateur), décote L2 = 73,54 % (= 1 − 26,46 %). **Bad debt total : 230 113 582 $** (WETH 98 702,90/228,43 M$ ; wstETH 589,17/1,68 M$ ; trivial USDC/WETH.e). Par chaîne : Mantle **71,45 %** shortfall (77,71 M$, 33 542,33 WETH — le plus fort) ; Arbitrum 26,67 % (88,41 M$) ; Base 23,28 % (47,50 M$) ; Ink 18,00 % (13,93 M$) ; Arbitrum wstETH 3,03 % ; Linea 2,68 % ; Ethereum Core **non affecté** (0 %).

Le texte souligne : « The scenarios are presented as options rather than expected outcomes » — décision finale = Kelp, hors du contrôle d'Aave.

### 4. Umbrella (mécanique, chiffres exacts)

Sous Scénario 1 : module Umbrella WETH concerné (Core WETH absorbe du bad debt). **18 922 aWETH sur 23 507 aWETH stakés sont déjà en cooldown** au moment du rapport — risque de fuite de capital documenté. Recommandation : pause préventive (blocage dépôts/retraits/transferts/slashing ; les récompenses continuent). Mécanique du cooldown précisée : pause > 22 jours (20 j cooldown + 2 j fenêtre de retrait) pour que tous les cooldowns en cours expirent, restaurant la couverture effective totale.
Sous Scénario 2 : Umbrella (qui ne couvre QUE Ethereum Core) non concerné, aucune pause nécessaire.

### 5. Illiquidité WETH et risque de liquidation (mesuré)

Réserves WETH sur Ethereum/Arbitrum/Base/Linea/Mantle **toutes à 100 % d'utilisation**, soldes inactifs < 20 $ sur chaque chaîne — un liquidateur saisissant du WETH reçoit de l'aWETH à la place si le pool est illiquide. Tables chiffrées (dette brute non-corrélée entrant en liquidation / bad debt résiduel après bonus, par chute de prix WETH 5 % à 50 %, par chaîne) — voir digest.txt pour le détail complet. État au moment de la rédaction : **6 077 fournisseurs WETH**, **4 874,6 M$ de collatéral WETH**, **2 870,9 M$ de dette non-corrélée**. Mantle le plus résilient (première liquidation à −22 % WETH) ; Base et Arbitrum les moins tamponnés (première liquidation à −0,77 %/−1,77 %, boucles à HF ~1,03).

### 6. Trésorerie DAO (contexte, mesuré, daté « au 20 avril 2026 »)

181 M$ d'actifs (62 M$ corrélés-ETH, 54 M$ AAVE, 52 M$ stablecoins). Revenu total 2025 : 145 M$. 2026 YTD : 38 M$ de revenu, 16 M$ de résultat net. Flux de trésorerie opérationnel : 149 M$ (2025), 40 M$ YTD 2026.

## Mise à jour officielle #1 — Post #41 (LlamaRisk, 2026-04-21T11:16:17Z) — [lu]

Dégel des réserves WETH sur Core et Prime (deux transactions Etherscan citées) ; **LTV WETH reste à 0**.

## Mise à jour officielle #2 — Post #65 (LlamaRisk, 2026-04-22T08:18:07Z) — [lu] intégral — RÉVISION DES CHIFFRES DE BAD DEBT

C'est le post explicitement référencé par le thread 24740 (« LlamaRisk's follow-up analysis », lien `.../24580/65`) — confirmé, le lien pointe exactement ici.

Suite au gel de **30 766 ETH** par l'Arbitrum Security Council (2026-04-21, tx `0x5618...`, transférés vers un wallet intermédiaire gelé, non récupérables par l'adresse d'origine), estimation RÉVISÉE en supposant ces fonds restitués à Kelp :

- **Scénario 1 révisé : 62 427 143 $** (vs 123,7 M$ initial — quasi -50 %). WETH 26 043,41/60,38 M$ ; wstETH 717,10/2,05 M$.
- **Scénario 2 révisé : 162 478 024 $** (vs 230,1 M$ initial). WETH 69 680,47/161,27 M$ ; wstETH 424,79/1,21 M$.
- Détail par chaîne (Scénario 1) : Ethereum Core 44,78 M$ (shortfall **0,75 %**, en forte baisse depuis 1,54 %) ; Mantle 5,91 M$ (**5,44 %**, toujours le plus fort relatif) ; Arbitrum 5,38 M$ (1,62 %) ; Base 3,37 M$ (1,65 %) ; Ink 0,91 M$ (1,18 %).
- Détail par chaîne (Scénario 2) : Mantle 51,47 % (vs 71,45 %) ; Arbitrum 18,26 % (vs 26,67 %) ; Base 16,74 % (vs 23,28 %) ; Ink 12,91 % (vs 18,00 %) ; Ethereum Core toujours 0 (non affecté par construction du scénario).

**Ces deux jeux de chiffres (initial post #1, révisé post #65) ne sont PAS contradictoires : le second est une révision explicite datée du premier, suite à un événement de récupération nouveau (gel Arbitrum). Toujours distinguer la date/version citée dans tout usage futur.**

## Mise à jour officielle #3 — Post #158 (LlamaRisk, 2026-04-23T15:22:58Z) — [lu]

rsETH **mis en pause** (au-delà du simple LTV=0) via le Protocol Guardian sur Ethereum Core, Arbitrum, Base, Mantle, Linea — 5 hash de transaction fournis (un par chaîne, Etherscan/Arbiscan/BaseScan/Mantlescan/LineaScan), non reproduits ici (voir digest.txt), objectif déclaré : préserver la valeur récupérable.

## Suite gouvernance — Post #173 (AaveLabs, 2026-05-01T15:24:19Z) — [lu]

AIP levé pour implémenter le « Technical Plan » du DeFi United : **« will liquidate the attacker's position without exposing any Umbrella Stakers to slashing »**. Vote : `app.aave.com/governance/v3/proposal/?proposalId=478`. Posts #175-176 (2026-05-02) : l'AIP initial a été annulé puis **recréé** sous le même `proposalId=478` (motif de l'annulation non donné dans le thread). Derniers posts (#178-180, 2026-05-05) : utilisateurs demandent le statut de BASE ETH gelé ; réponse communautaire (non officielle) : liquidation des positions du hacker « will execute shortly ».

## Positions communautaires notables (échantillon représentatif, PAS des faits — distinction faite)

- **Débat central, non tranché par Aave/Kelp dans ce thread** : Scénario 1 (socialisation globale rsETH, tous détenteurs) vs Scénario 2 (pertes isolées aux L2). Arguments juridiques opposés sur le statut « pari passu » du token OFT rsETH (posts #2, #17, #55, #58, #61-62, #135-166 — débat prolongé, contradictoire, invoquant notamment *Ripple vs SEC* comme précédent, sans consensus atteint dans le thread).
- **`robtg4`, post #24** : cite un fait de gouvernance antérieur non vérifié par moi cette passe — « In January 2026, Proposal 434 raised rsETH's LTV to 93% in E-Mode » — **procurement formé ci-dessous** (directement pertinent pour Ukemi : historique LTV e-mode d'un actif LST tracké).
- **`0xJacko` (post #22) et plusieurs autres** : chiffres informels de la « taille » de l'incident distincts des chiffres officiels de bad debt — « $292M »/« $293M » (posts #24, #59, source : blog personnel `tokedex.org`, non vérifié en primaire), « $200 million » (thread 24740 post #20), « $236 million » (post #100, citant un article Paragraph.com externe, non vérifié). **Aucun de ces chiffres ne provient du rapport officiel LlamaRisk** (qui ne donne que les bad debt scenario totals : 123,7 M$/230,1 M$ puis 62,4 M$/162,5 M$) — à ne jamais citer comme des chiffres Aave officiels.
- **`AAVEJesus` (posts #79, #85, #88, etc.)** : position répétée « AAVE IS NOT DECIDING BETWEEN SCENARIO 1 AND SCENARIO 2. KELP IS » — position, contestée par d'autres (`GG12`, posts #91, #96, #98, #102...) qui soutiennent qu'Aave, en gelant/modélisant, participe à la chaîne de décision. Débat non tranché.
- **`Arasaka` (post #19)** cite verbatim la documentation officielle Umbrella (utile pour Ukemi D5) : « Slashing is triggered automatically by UmbrellaCore when a deficit in the corresponding Aave pool exceeds the configured offset » et « The cooldown period is 20 days... followed by a 2-day unstake window... During cooldown, rewards continue to accrue and funds remain slashable. »

## Contradictions (doc 03 règle 7, rapportées sans trancher)

1. **116 500 vs 152 577 rsETH** — résolu dans CE thread même (voir §1 ci-dessus) : deux mesures différentes (volé vs créances L2 totales), pas une contradiction. Signalé ici car la distinction n'était pas claire avant lecture complète (cf. `ETUDE-APIFY-2026-09-20.md`).
2. **Taille « totale » de l'incident** : $292-293M (blog tiers) / $200M (thread 24740) / $236M (blog externe cité en post #100) / $221,39M (valeur officielle des dépôts rsETH de l'attaquant sur Aave, post #1) — quatre valeurs non réconciliées, aucune ne correspondant aux totaux de bad debt officiels ($123,7M/$230,1M initial ; $62,4M/$162,5M révisé). Non tranché, chiffres de nature différente (valeur déposée vs bad debt modélisé vs estimations tierces non sourcées).
3. **Statut légal du rsETH L2 (pari passu ou non)** — débat juridique communautaire non résolu dans le thread, deux lectures opposées des mêmes CGU Kelp/LayerZero (silence interprété différemment par les deux camps).

## Pertinence directe pour Ukemi (ADR-M020)

- rsETH fait partie des collatéraux e-mode LST déjà trackés par ADR-M020 (fact 6 : « wstETH/weETH/rsETH... taux plafonné × ETH/USD »). Ce thread démontre un **mode de défaillance structurellement différent** de CAPO : CAPO = manipulation/staleness du **taux** oracle ; ici = collapse du **backing** sous-jacent via exploit de pont cross-chain, un canal totalement externe au mécanisme de plafonnement de taux. Le post #1 le dit explicitement : « Aave should plan for a window during which the rsETH oracle continues quoting the pre-exploit rate unless Aave's own feed is updated independently » — un risque de **staleness** analogue en esprit au problème CAPO (`snapshotRatio` périmé), mais pour une cause racine différente (le taux interne Kelp lui-même devient trompeur après le hack, pas un défaut de mise à jour du plafond).
- Confirmation supplémentaire (troisième source primaire indépendante, après thread 24269/24275 et thread 24446) du départ de Marc Zeller/ACI et Chaos Labs (post #18 du thread 24740, cité dans le fichier associé — la mention explicite est dans 24740, pas ici, mais le contexte général de « departing SPs » est présent dans ce rapport aussi via les questions de gouvernance).
- Aucune mention directe de CAPO, e-mode ETH-only, ou sUSDe/USDe dans ce thread — l'incident et le rapport sont **structurellement indépendants** du périmètre CAPO déjà documenté ; seul le point commun est « rsETH comme actif e-mode tracké ».

## Ce que ce thread n'établit pas

- La décision finale de Kelp (Scénario 1 vs 2 vs autre) — non annoncée dans la fenêtre du thread capturé (dernier post substantiel 2026-05-05, clôture auto 2026-06-04).
- Le résultat de l'AIP `proposalId=478` (exécuté ou non, montant final liquidé).
- Une confirmation indépendante (non-Aave) du contenu de « Proposal 434 » (LTV rsETH 93 % e-mode, janvier 2026) — cité par un poste communautaire, non vérifié en primaire.
- Le contenu exact du thread croisé « rsETH incident — 2026-04-18 » (id 24481, cité en post #109) — thread distinct, non lu.
- Un chiffre unique et définitif de la « taille » de l'incident (voir contradiction #2 ci-dessus).

## NON TROUVÉ

1. Décision finale Kelp (Scénario retenu) — hors fenêtre du thread.
2. Résultat définitif de l'AIP proposalId=478 (exécution confirmée, montant liquidé réalisé).
3. Vérification primaire de « Proposal 434 » (LTV rsETH 93 % e-mode, janvier 2026).
4. Contenu du thread croisé 24481 (« rsETH incident — 2026-04-18 »), cité en post #109, non lu cette passe.
5. Contenu du thread 24684 (« [ARFC] Improve Liquidity Buffer for USDC on Aave V3 Ethereum Core »), cité en post #115 par `GordonLiao`, non lu — tangent (stress de liquidité stablecoin concomitant, pas rsETH lui-même).

## Procurements formés (nouveaux)

| Réf | Document | Identité | Tentatives | Usage prévu |
|---|---|---|---|---|
| PR-UK-19 | « Proposal 434 » (LTV rsETH 93 % e-mode) | Snapshot/governance.aave.com, janvier 2026, cité par thread 24580 post #24 (`robtg4`), non vérifié en primaire | Non recherchée cette passe (hors budget) | Historique de paramètres LTV/e-mode d'un actif directement tracké par Ukemi (rsETH) |
| PR-UK-20 | « rsETH incident — 2026-04-18 » | thread 24481, cité par thread 24580 post #109 | URL/slug non recherchés cette passe | Vérifier s'il s'agit d'un doublon/complément du présent rapport ou d'un thread distinct antérieur |
| PR-UK-21 | AIP `proposalId=478` (« Technical Plan » DeFi United — liquidation de la position de l'attaquant) | `app.aave.com/governance/v3/proposal/?proposalId=478`, SPA côté client (probable rendu non statique, cf. précédent similaire proposalId=330 dans `ETUDE-APIFY-2026-09-20.md`) | Non fetchée cette passe | Confirmer l'exécution finale et le montant réellement liquidé de la position de l'attaquant |

## Journal des URL

| URL | Outil | Résultat | Date |
|---|---|---|---|
| `governance.aave.com/t/24580.json` | curl | 200, 20/173 posts (page 1), stream complet (173 ids) obtenu dans la même réponse | 2026-09-20 |
| `governance.aave.com/t/24580/posts.json?post_ids[]=...` (8 lots de ≤ 20 ids, 153 posts) | curl ×8 | 200 ×8, 153/153 posts reçus, aucun manquant | 2026-09-20 |

Aucun 429 rencontré sur les 9 requêtes de ce thread. Politesse ≥ 1 s respectée entre chaque requête.
