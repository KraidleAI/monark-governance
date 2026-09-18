# INVENTAIRE-stables — candidats à une 2e clé Narabi (mission 2026-09-18)

Même loi que USDe = mint/burn on-chain 24/7 en `Transfer` <-> 0x0 + `totalSupply`, une seule voie de rachat.
Leçon F2-A msUSD (rappel, source `F:/Monark/docs/CLOTURE-lot-f2b-usde.md` section 2(a), [lu]) : calibration
dégénérée refusée quand support/dégénérescence insuffisants — ex. nommé dans ce fichier : "ρ<0.30, n<50, q̂=0
largeur nulle ⇒ under_calib. (C'était l'issue de F2-A msUSD — un seul jour calme à rachat, q̂=0.)" Donc : un
candidat avec un seul régime (jamais de rachat notable, ou au contraire rachat permanent sans jour calme) est
refusé au même titre.

Discipline : [lu]/[abs]/[2nd] par entrée ; chiffres avec date/URL ; NON TROUVÉ si applicable. Verdict provisoire
uniquement (pas de calibration effectuée dans cette passe de recherche).

Statut d'avancement (mis à jour au fil de l'eau) :
- [x] sUSDe
- [x] USDe (autres chaines / bridged)
- [x] USDX (Stables Labs)
- [x] USR (Resolv)
- [x] deUSD (Elixir)
- [x] USDtb
- [x] USD0 (Usual)
- [x] FRAX / frxUSD
- [x] crvUSD
- [x] LUSD / BOLD
- [x] GHO (renvoi A.3)
- [x] USDS (renvoi A.4 + complement adresse/supply)

---

## 1. sUSDe (Staked USDe, Ethena)

**Mécanisme [lu], source P1** : `https://docs.ethena.fi/llms-full.txt` (dump consolidé de la doc officielle
Ethena, fetch direct curl, HTTP 200, 399 683 octets) — verbatim :
> "on burning of sUSDe, USDe is sent to a separate silo contract to hold the assets for the cooldown period.
> And on withdrawal, the staking contract moves those funds from the silo contract out to the user's address.
> The cooldown is configurable up to 90 days."

> "Users must first request their USDe be unstaked wherein their USDe will be placed in the USDeSilo smart
> contract. Once the cooldown period has elapsed, users will be able to withdraw their USDe from the USDeSilo
> smart contract."

**Réponse à la question de la mission (« burn ou unstake ? ») : LES DEUX, mais pas sur le même token.**
- **sUSDe EST brûlé** (`Transfer sUSDe → 0x0`) **immédiatement** à la demande de déstaking (confirmé verbatim
  "on burning of sUSDe").
- **USDe, lui, N'EST PAS brûlé** à ce moment : il est seulement déplacé du contrat `StakedUSDeV2` vers le
  contrat `USDeSilo`, puis libéré vers l'utilisateur après cooldown — aucun `Transfer→0x0` d'USDe, aucune
  variation du `totalSupply` d'USDe pendant tout ce processus.
- Donc mesurer sUSDe via `Transfer↔0x0` + `totalSupply` mesurerait une action différente (déstaking) de ce que
  mesure USDe (rachat USD), avec un **cooldown configurable jusqu'à 90 jours** — **rupture de la propriété
  "24/7 instantané"** que la mission exige pour la "même loi". Ce n'est PAS le même objet économique.

**Adresses (P1, docs Ethena, URLs Etherscan intégrées à la doc)** :
- `StakedUSDeV2.sol` (sUSDe) : `0x9d39a5de30e57443bff2a8307a4256c8797a3497` — confirmé par recoupement avec un
  second résultat de recherche indépendant (titre Etherscan "Staked USDe (sUSDe) | ERC-4626 | Address:
  0x9d39a5de...8797a3497"). Cohérent.
- `USDeSilo` : `0x7FC7c91D556B400AFa565013E3F32055a0713425` (URL trouvée dans le texte de doc :
  `etherscan.io/address/0x7FC7c91D556B400AFa565013E3F32055a0713425#tokentxns`) — **non recoupé** par une
  deuxième source indépendante dans cette passe ; à vérifier avant usage committé (longueur d'adresse à
  recompter si repris tel quel).

**Supply / épisode notable** : non chiffré séparément dans cette passe (sUSDe suit la supply d'USDe stakée, pas
mesurée isolément ici). L'épisode notable pertinent est celui d'USDe (oct. 2025, déjà documenté dans
`CLOTURE-lot-f2b-usde.md`, réutilisé — pas re-mesuré ici).

**Verdict provisoire : REFUSER comme "même loi que USDe".** Le burn existe bel et bien, mais l'objet mesuré
(déstaking, cooldown jusqu'à 90 jours) n'est PAS le rachat 24/7 instantané que la classe `stable-run-velocity-24h`
suppose. Pourrait être un **candidat pour une AUTRE classe** (vélocité de déstaking avec cooldown, calibration
différente), pas une extension immédiate de la classe existante — **à clarifier** si un jour proposé, mais
refuser tel quel pour "même loi".

---

## 2. USDe sur autres chaines (bridgé)

**Statut : NON TRANCHÉ EN P1 DIRECT — mécanisme générique confirmé (P2/agrégateur), détail Ethereum-spécifique
NON TROUVÉ dans la doc Ethena consultée.**

- P2 [lu] (résumé WebSearch, Messari report *"LayerZero: Scaling Stablecoin Issuers with the OFT Standard"*) :
  USDe utilise le standard **LayerZero OFT**, déployé sur plus de 10 chaines depuis août 2024. Le mécanisme
  générique OFT est "burn-and-mint" : brûlé sur la chaine source, minté sur la chaine destination, "réalisant
  une supply unifiée cross-chain".
- **Recherche du détail Ethereum mainnet (canonique)** : par analogie avec USDT0 (même standard LayerZero OFT,
  Tether) — confirmé P2 : *"The original asset (USDT...) is locked in the OFT Adapter smart contract on
  Ethereum Mainnet. [...] Tokens can be redeemed by burning them on any chain and unlocking the corresponding
  assets on the Ethereum OFT Adapter."* — pour USDT0, la chaine canonique (Ethereum) **verrouille** (lock),
  elle ne brûle PAS ; seules les chaines destination brûlent/mintent. **Analogie non confirmée pour USDe** : la
  recherche dans le dump complet de la doc Ethena (`llms-full.txt`, [lu] intégral, 4009 lignes) ne contient
  **qu'UNE seule occurrence** du mot "LayerZero", et elle concerne **ENA** (le token de gouvernance), pas USDe.
  **NON TROUVÉ** : aucune confirmation P1 que le contrat USDe.sol sur Ethereum utilise lock (pas de
  `Transfer→0x0`) plutôt que burn direct lors d'un bridge sortant.

**Pourquoi c'est important pour Narabi (note méthodologique, pas juste pour ce candidat)** : SI USDe sur
Ethereum utilisait un burn direct pour les sorties de bridge (hypothèse non confirmée, probablement fausse par
analogie avec USDT0/pattern standard "canonical chain locks"), les `Transfer→0x0` mesurés par l'`AttestedFlow`
existant incluraient du trafic de bridge, pas seulement du rachat USD — **contaminerait potentiellement la
classe USDe déjà committée**. Vu l'analogie avec USDT0 et l'absence de toute mention OFT/LayerZero associée à
USDe.sol dans la doc primaire, l'hypothèse la plus probable est que **cette confusion NE se produit PAS**
(Ethereum = chaine canonique avec verrouillage, pas de burn), mais ceci reste **NON CONFIRMÉ EN P1** — recommandé
comme point de vérification séparé (lire le contrat `USDe.sol` lui-même pour la liste des `MINTER`/adresses
autorisées à appeler `burn`, et vérifier si une adresse "OFT Adapter" y figure).

**Verdict provisoire pour "USDe sur autres chaines" comme candidat B** : **REFUSER** tel que formulé par la
mission elle-même ("bridgé = pas un burn natif ?") — la présomption forte (via l'analogie USDT0 et l'architecture
standard OFT pour un token déjà établi sur sa chaine d'origine) est que les representations bridgées sur les
autres chaines ne sont PAS le même contrat/la même autorité de `totalSupply` que le USDe canonique d'Ethereum
déjà committé ; mesurer une chaine bridgée séparément mesurerait une **supply locale dérivée**, pas la loi
Ethena elle-même. À clarifier seulement si un besoin précis émerge (ex. Plasma/Monad/Mantle où Aave a justement
de l'exposition USDe, cf. A.1) — dans ce cas relire le contrat déployé SUR CETTE CHAINE spécifique (pas Ethereum).

---

## 3. USDX (Stables Labs)

**Mécanisme [lu/2nd mêlés]** :
- P1 partiel (docs.usdx.money, WebFetch, [lu] extrait) : *"A user deposits ~$100 of USDT, USDC or USDe and
  receives ~100 USDX in return less any execution costs to execute the hedge."* Rachat : *"Only approved
  entities from eligible jurisdictions that have successfully passed KYC/KYB screenings and got white-listed
  can directly mint and redeem USDX on-demand using usdx.money contracts."* — **mint/redeem N'EST PAS ouvert à
  tous** (whitelist KYC/KYB), contrairement à USDe. Page ne confirme pas explicitement burn on-chain
  (`Transfer→0x0`) — **NON TROUVÉ** en P1 direct pour ce détail précis dans l'extrait obtenu.
- P2 [lu] (WebSearch synthèse) : *"whitelisted addresses can deposit USDX and redeem into USDT in 7 days"* —
  **rachat à 7 jours pour la voie institutionnelle**, pas 24/7 instantané ; *"for faster conversion... users can
  exit positions through liquidity pools (LPs)"* — **DEUX voies de sortie** (rachat institutionnel à délai +
  marché secondaire/LP) — **exactement le type de "deux lois" que la mission demande de refuser** (comparer au
  cas DAI/USDS : "deux lois dans un v").

**Adresse Ethereum** : `0xf3527ef8de265eaa3716fb312c12847bfba66cef` — source CoinGecko (WebFetch, [lu], PAS
recoupé sur Etherscan directement dans cette passe — **P3/agrégateur, à vérifier avant usage committé**).

**Supply (au 2026-09-18, date du fetch CoinGecko, pas de date de snapshot explicite fournie par la page)** :
circulating supply **684,556,000 USDX** (~684.6M), market cap **$6.041M** — implique un prix de marché
**≈ 0,0088 $ par token**, très loin du peg à 1$. C'est une **confirmation directe et datée (jour du fetch,
2026-09-18) que le depeg N'EST PAS résorbé** dix mois après l'incident (voir ci-dessous).

**Épisode notable — DEPEG MAJEUR, CONFIRMÉ MULTI-SOURCES** :
- P1 (compte X officiel @StablesLabs, cité verbatim par plusieurs agrégateurs de presse, [2nd] pour moi — je
  n'ai pas ouvert directement le tweet, seulement son texte rapporté) : *"Balancer V2 Vault has encountered a
  security breach, during which a hacker drained approximately $1 million worth of assets (USDX + sUSDX) from
  the USDX/sUSDX V2 pool."*
- P2 [lu] (Cryptopolitan, WebFetch) : exploit divulgué le **3 novembre 2025**, crise aggravée au **6 novembre
  2025** — USDX passe sous **0,60 $** sur les DEX majeurs, alors que la supply circulante dépassait **683 M$**
  avant l'effondrement. *"due to market liquidity conditions and liquidation dynamics, the market price of USDX
  has experienced a deviation from its reference value"*. Liquidation Lista DAO : 3,5 M USDX liquidés pour
  récupérer ~2,9 M USD1.
- P2 [lu] (WebSearch, multi-articles recoupés) : plan de "recovery" en phases annoncé par Stables Labs, **sans
  garantie de délai ni de restauration complète** ; fermeture soudaine du canal Discord communautaire signalée
  comme signal négatif par des observateurs.
- **Recherche d'un état à jour (septembre 2026)** : **NON TROUVÉ** — les résultats de recherche restent centrés
  sur novembre 2025 ; aucune mise à jour trouvée datée septembre 2026. Le chiffre de marché ci-dessus
  (prix ≈0,0088$, fetché 2026-09-18) est la meilleure preuve indirecte que la situation reste dégradée.

**Verdict provisoire : REFUSER.** Deux voies de rachat distinctes (institutionnel 7 jours vs LP/marché
secondaire) = "deux lois dans un v" (même défaut que DAI/USDS pointé par le mémo). Protocole en crise de peg
non résorbée (prix ≈0,0088$ au 2026-09-18 contre un peg visé à 1$), ce qui produirait une calibration
totalement dominée par un régime de stress permanent depuis nov. 2025 — potentiellement l'inverse du problème
msUSD (au lieu de "aucun rachat", "rachat en crise permanente sans jour calme") mais également dégénéré au sens
de la leçon F2-A. À ne PAS mesurer en l'état.

---

## 4. USR (Resolv)

**Mécanisme [lu], source P1** : `docs.resolv.xyz` (WebSearch + citations directes) — *"When USR is redeemed, a
user receives a 1:1 equivalent to the notional amount of the USR burned less redemption fees."* Rachat vers
USDC ou USDT, frais actuellement à zéro, **"USR redemption is processed within 24 hours"** — pas instantané
comme USDe (fenêtre de traitement de 24h, pas de cooldown à 90 jours comme sUSDe, mais pas non plus 24/7
atomique). Supply élastique, mint/burn, pas de plafond déclaré.

**Contrats** : adresses d'oracles listées (`0x7f45180d6fFd0435D8dD695fd01320E6999c261c`,
`0xf9C7c25FE58AAA494EE7ff1f6Cf0b70d7C7ce88c`) — **PAS l'adresse du token USR lui-même**, qui n'a pas été
retrouvée dans cette passe (**NON TROUVÉ** — le dépôt `resolv-contracts-public` sur GitHub est cité comme
source canonique, non ouvert ici).

**Épisode notable — EXPLOIT MAJEUR, CONFIRMÉ EN P1 (postmortem officiel)** :
Source P1 [lu] intégral (WebFetch) : `https://resolv.xyz/blog/resolv-postmortem-march-22-2026-incident` —
citations verbatim :
> "The first illicit transaction was executed at 02:21:35 UTC" [22 mars 2026] "...minting 50M USR through the
> Counter contract" puis "At 03:41 UTC, a second illicit transaction was executed" "...minting an additional
> 30M USR" — **total 80M USR mintés illégitimement**, extraction *"approximately $25M in value as ETH"*.
> "Approximately 46M USR out of 80M illicitly minted were neutralized through direct burns and the deployment
> of blacklist functionality after the required timelock period." — soit **57,5% environ** du montant
> illégitime neutralisé (par burn + blacklist) ; **~34M USR restants** sous investigation à la date de
> publication du postmortem.

Cause racine (P2, recoupée par plusieurs médias — Blockaid, CoinDesk, The Block, tous datés 2026-03-22/23,
cohérents entre eux) : clé de service (`SERVICE_ROLE`) compromise, contrôlée par un **compte unique (EOA), pas
un multisig**, contrat de mint sans vérification oracle ni limite de montant. Prix USR tombé sous **0,80$** en
quelques minutes, puis jusqu'à **0,20$ et en dessous** selon The Block/AMBCrypto.

**Verdict provisoire : À CLARIFIER (pencher REFUSER en l'état).** Le mécanisme de base (burn on-chain,
`Transfer↔0x0`, rachat 1:1 moins frais) ressemble bien à "la loi USDe". MAIS : (a) fenêtre de traitement
"24h" documentée (pas 24/7 atomique comme USDe — à vérifier si c'est un délai contractuel ou juste un SLA
opérationnel habituel) ; (b) un exploit majeur (80M USR illégitimes, ~57,5% neutralisés par burn+blacklist
d'où un régime de `Transfer→0x0` en mars 2026 qui MÉLANGERAIT rachats légitimes et burns de remédiation
post-hack — casserait l'identité C1 "burn=rachat" si non isolé) ; (c) adresse du token USR non confirmée dans
cette passe. Mesurer nécessiterait d'abord d'isoler/exclure la fenêtre de mars 2026 (comme le F2-B USDe a exclu
le pic oct. 2025) ET de confirmer que les burns de remédiation ne polluent pas la série "calme".

---

## 5. deUSD (Elixir)

**Statut : REFUSER — protocole TERMINÉ (sunset), pas juste "à mesurer".**

- P2 [lu] (The Block, WebSearch) : *"Elixir sunsets deUSD synthetic stablecoin following Stream Finance
  unwinding, aims for full redemptions"* — Elixir a **cessé les opérations de mint et de rachat** de deUSD pour
  éviter de nouveaux risques de liquidité liés à l'exposition à Stream Finance.
- P2 [lu] (WEEX, recoupé) : *"Elixir announces the termination of the deUSD synthetic stablecoin, pledging a
  100% redemption"* — rachat prévu 1:1 vers USDC via un "claims portal" après snapshot des soldes, **PAS via le
  mécanisme normal de mint/redeem on-chain** (celui-ci est désactivé).
  Concentration extrême : *"Stream holds approximately 90% of the deUSD supply (around $75 million)"* — un
  seul détenteur porte ~90% de la supply, ce qui rendrait toute calibration structurellement dégénérée
  (dépendance à un seul acteur, pas une population diversifiée de rachat).

**Verdict : REFUSER, sans ambiguïté.** Le mécanisme de rachat "loi USDe" (mint/burn 24/7 on-chain) est **arrêté
(mint ET redeem désactivés)** ; le rachat final annoncé passera par un portail de réclamation hors-chaine
(claims portal), pas par le `Transfer↔0x0` on-chain normal. Concentration ~90% sur un seul détenteur (Stream)
ajoute une deuxième raison de refus indépendante (même en cas de reprise, la population ne serait pas
diversifiée). Adresse contrat et supply non recherchées davantage (refus déjà net, pas de valeur ajoutée à
creuser plus loin dans cette passe).

---

## 6. USDtb (Ethena, backé BUIDL BlackRock)

**Mécanisme [lu/2nd]** :
- P1 [lu] (dump `docs.ethena.fi/llms-full.txt`, [lu] intégral) : *"As of October 2025, USDtb is issued by
  Anchorage Digital Bank."* Et P1 [lu] (WebFetch `docs.usdtb.money/`) : *"as of October 13, 2025, the issuance,
  redemption, and reserve management for USDtb were transitioned to Anchorage Digital Bank"* ; backing
  *"BlackRock's USD Institutional Digital Liquidity Fund Token, BUIDL"*. Les deux pages consultées en P1 **ne
  détaillent PAS** le mécanisme exact de rachat on-chain (burn vs via l'émetteur Anchorage) ni l'adresse
  contrat — **NON TROUVÉ en P1 direct** pour ces deux points précis.
- P2 [lu] (WebSearch, synthèse recoupée) : *"Direct 1:1 mint and redemption; BUIDL shares redeemable 24/7 via
  atomic swap with Securitize; LayerZero OFT cross-chain transfers"* ; rachat institutionnel par virement
  bancaire/SWIFT avec *"typical settlement times of around 15 minutes"*. **Structure à AU MOINS deux couches** :
  (a) rachat direct USDtb via l'émetteur (Anchorage), qui lui-même (b) dépend du rachat de sa réserve BUIDL
  via Securitize — dépendance en cascade sur un tiers (BlackRock/Securitize), pas un burn on-chain autonome au
  sens strict d'USDe. **Même famille de risque que "deux lois" (DAI/USDS, USDX)**, ici plutôt "une loi
  dépendante d'une contrepartie hors-chaine".

**Adresse Ethereum / supply** : **NON TROUVÉ** dans cette passe (pas cherché spécifiquement au-delà des pages
ci-dessus ; le token USDtb a bien une adresse ERC-20 propre, non retrouvée ici — à procurer si approfondi).

**Épisode notable** : **NON TROUVÉ** dans cette passe (pas de recherche dédiée sur un épisode de rachat massif
USDtb ; probablement rare étant donné le profil "calmer alternative to USDe" cité par une source P2).

**Verdict provisoire : À CLARIFIER.** Mécanisme institutionnel (émetteur bancaire régulé + fonds BlackRock),
probablement PLUS stable qu'USDe mais aussi probablement moins mesurable en 24/7 pur on-chain sans dépendance à
un tiers hors-chaine — nécessite une lecture directe du contrat USDtb.sol (non faite ici) avant tout verdict
ferme.

---

## 7. USD0 (Usual Protocol)

**Mécanisme [lu], source P1** : `https://docs.usual.money/usual-products/usd0-stablecoin/usd0/flow-and-architecture`
(WebFetch, [lu]) — **DEUX voies de mint ET deux voies de rachat**, citées verbatim :
- Mint direct : dépôt de token RWA (ex. USYC) dans `DaoCollateral` → *"receive USD0 1:1."*
- Mint indirect : dépôt USDC via `SwapperEngine`, *"a Collateral Provider (CP) supplies the underlying RWA
  collateral on their behalf."*
- Rachat marché primaire : présenter USD0 à `DaoCollateral` → *"receive the underlying tokenized Treasury Bills
  at 1:1 par value"* (rachat contre des **T-Bills tokenisés**, PAS du cash/USDC directement).
- Rachat marché secondaire : *"can sell USD0 for USDC, USDT, or other stablecoins on secondary markets,
  including decentralized exchanges (e.g., Curve, Uniswap)"* — un marché de prix, pas un rachat protocolaire.
- Le burn on-chain (`Transfer→0x0`) précis n'est **pas confirmé verbatim** dans l'extrait obtenu — **NON
  TROUVÉ** pour ce détail exact (contrat `DaoCollateral`, adresse `0xde6e1F680C4816446C8D515989E2358636A38b04`
  citée par un résultat de recherche indépendant, non recoupée directement sur Etherscan dans cette passe).

**Distinction critique (collision à ne pas fusionner)** : l'épisode notable trouvé (voir ci-dessous) concerne
**USD0++**, une variante VERROUILLÉE/obligataire de USD0 (bond-like, maturité), **PAS USD0 lui-même**. Le mémo
demande "USD0 (Usual)" — je garde donc le mécanisme USD0 (ci-dessus, deux voies) comme objet principal, et je
signale l'épisode USD0++ séparément, sans le faire passer pour un épisode "USD0".

**Épisode notable — USD0++ (PAS USD0), CONFIRMÉ MULTI-SOURCES P2 RECOUPÉES** :
- Daté **9-10 janvier 2025** : *"the price of USD0++ suddenly dropped, hitting a low of $0.89"* (The Block,
  [lu]) ; le 10 janvier, Usual a annoncé un changement du mécanisme de rachat, remplaçant le rachat fixe 1:1 par
  un **floor price à 0,87$** (nouveauté rétroactive, non annoncée à l'avance). Controverse importante :
  *"critics accused the protocol of locking 13% of principal investments without due warning"* ; le floor price
  devait remonter graduellement vers 1$ sur **4 ans**.
- Ceci est un changement DE RÈGLE DU JEU en cours de route (pas juste un choc de marché), donc structurellement
  différent des autres épisodes de cette liste (exploit, illiquidité) — c'est un **risque de gouvernance/
  changement de mécanisme unilatéral**, pertinent si un jour USD0++ était considéré comme candidat séparé.

**Verdict provisoire (USD0, pas USD0++) : REFUSER pour "une seule voie de rachat"** — deux voies de mint et
deux voies de rachat documentées en P1, dont l'une (marché secondaire) n'est pas un rachat protocolaire au sens
strict. Même défaut que DAI/USDS et USDX. USD0++ (le token concerné par l'épisode notable) est un objet
DIFFÉRENT, hors du périmètre strict de la question posée, et présente un risque de gouvernance additionnel qui
le disqualifierait de toute façon.

---

## 8. FRAX / frxUSD (Frax Finance)

**Mécanisme [lu], source P2 recoupée (pas de fetch P1 direct effectué dans cette passe — à noter)** :
*"frxUSD supports redemption back to USDC using either a custodian or RWA-based redemption path"* :
- Voie 1, **custodian-based** : dépôt USDC dans `FraxNetDeposit` → mint frxUSD via un custodian agréé.
- Voie 2, **RWA-based** : frxUSD converti en USTB (Superstate) puis racheté en USDC via *"Superstate's USTB
  liquidity buffer which maintains $10 million in USDC liquidity for redemptions against USTB"* — **buffer de
  liquidité PLAFONNÉ à 10 M$**, donc cette voie peut s'épuiser (contrainte structurelle explicite, pas illimitée
  comme le burn USDe).
- **DEUX voies de rachat distinctes** = même défaut "deux lois" que DAI/USDS/USDX/USD0.

**Adresses (P2, Etherscan/BaseScan/Optimistic Etherscan, non recoupées en P1 direct)** :
- Ethereum (canonique, "frxUSD") : `0xCAcd6fd266aF91b8AEd52aCCc382b4e165586e29`.
- Base : `0xE5020a6D073A794B6e7F05678707dE47986FB0b6`. Optimism :
  `0x80eede496655fB9047dd39d9f418d5483eD600dF`.

**Supply / épisode notable** : **NON TROUVÉ** dans cette passe (pas de chiffre de supply daté obtenu ; pas de
recherche dédiée à un épisode de rachat notable pour frxUSD spécifiquement — le rebranding FRAX→frxUSD
lui-même est noté par une source P2 comme récent/2026 mais sans date exacte confirmée en P1).

**Verdict provisoire : REFUSER** — deux voies de rachat, dont une plafonnée à 10 M$ de liquidité (buffer
Superstate), structure incompatible avec "une seule voie de rachat on-chain 24/7" de la mission. À reconsidérer
seulement si la voie custodian-based s'avère être la SEULE en pratique (à vérifier par lecture directe du
contrat, non faite ici).

---

## 9. crvUSD (Curve Finance)

**Mécanisme [lu], sources P1/P2 mêlées (fetch P1 partiel — la page technique complète a 404)** :
- P2 [lu] (WebSearch, synthèse recoupée sur plusieurs pages Curve) : crvUSD est **minté quand un emprunteur
  verrouille du collatéral crypto** (ETH, LST, wBTC) dans les "mint markets" de Curve, et **brûlé au
  remboursement du prêt**. **Mécanisme PegKeeper séparé** : *"Peg Keepers can only mint crvUSD to trade into
  their associated pools when its pool balance of crvUSD is too low, or it can repurchase and burn the crvUSD
  if its pool balance is too high"* — un DEUXIÈME mécanisme de mint/burn, algorithmique, indépendant des prêts.
  Un TROISIÈME mécanisme existe (liquidation, via LLAMMA) — confirmé par fetch P1 partiel
  (`docs.curve.finance/developer/crvusd/overview`, WebFetch, [lu] extrait) : *"LLAMMA... responsible for
  liquidating collateral"*.
- **AU MOINS TROIS causes de burn distinctes** (remboursement de prêt, arbitrage PegKeeper, liquidation) —
  c'est le cas le PLUS net de "plusieurs lois dans un seul v" de tout cet inventaire, structurellement proche
  de DAI (vaults CDP) plutôt que d'USDe (facility unique).
- Fetch `resources.curve.finance/crvusd/faq/` : **HTTP 404**, échec, [échoué].

**Adresse / supply** : **NON TROUVÉ** dans cette passe (adresse du token crvUSD non confirmée ; supply non
chiffrée — DeFiLlama référencé par la recherche mais page stablecoins bloquée, voir SOURCES.md).

**Verdict provisoire : REFUSER, nettement.** Trois mécanismes de mint/burn indépendants et concurrents
(emprunt/remboursement, PegKeeper, liquidation) émettant tous le même `Transfer↔0x0` sans distinction
on-chain triviale de la CAUSE — exactement la situation que le mémo refuse pour DAI ("deux lois dans un v"),
ici avec une troisième loi en plus. Un adaptateur devrait d'abord désagréger les causes avant toute mesure,
hors de portée d'un simple `Transfer`+`totalSupply`.

---

## 10. LUSD / BOLD (Liquity V1 / V2)

**Statut préalable — collision de noms à ne pas fusionner** : LUSD (Liquity **V1**, toujours actif) et BOLD
(le token de Liquity **V2**, nom de remplacement, contrat DIFFÉRENT) sont **deux objets distincts**, malgré la
filiation. Le mémo les cite ensemble ("LUSD/BOLD") — je documente donc les deux séparément.

### LUSD (Liquity V1)

**Mécanisme [lu], source P1/P2 recoupées** : redemption directe — *"Any owner of LUSD can redeem their
stablecoins for the underlying ETH collateral at any time"* (docs.liquity.org, cité par recherche) — rachat
CONTRE DE L'ETH, pas contre du cash/USD directement, à la différence d'USDe. Frais dynamiques : *"(baseRate +
0.5%) * ETHdrawn"*, `baseRate` augmentant à chaque rachat et décroissant avec une demi-vie de 12h. **Redemptions
désactivées durant les 14 premiers jours du protocole** (non pertinent aujourd'hui, protocole ancien). En
PLUS de la redemption, LUSD est aussi brûlé au remboursement de prêt (Trove closure) et à la liquidation — même
défaut "plusieurs lois" que crvUSD/DAI (structure CDP classique).

**Adresse Ethereum** : `0x5f98805A4E8be255a32880FDeC7F6728C6568bA0` — confirmée par DEUX sources indépendantes
(Etherscan + Ethplorer, recoupées, [lu] résultats de recherche).

**Supply** : chiffres DIVERGENTS trouvés dans la même recherche — **"38,343,232"** vs **"~30,911,750.08 LUSD"**
— **divergence NON résolue dans cette passe**, signalée telle quelle, pas arbitrée (l'un pourrait être un
`totalSupply` historique/max et l'autre un solde courant, ou une confusion de l'outil de recherche entre deux
pages — à vérifier directement sur Etherscan avant tout usage committé). **Aucune date précise** attachée à
l'un ou l'autre chiffre — **NON TROUVÉ** pour la date exacte.

**Épisode notable** : **NON TROUVÉ** dans cette passe (pas de recherche dédiée à un run/depeg LUSD spécifique).

**Verdict provisoire LUSD : REFUSER** — plusieurs lois (redemption + remboursement + liquidation), ET rachat
contre ETH (pas USD), deux écarts au patron USDe.

### BOLD (Liquity V2)

**Mécanisme [lu/2nd]**, source P2 recoupée (WebSearch) : *"The CollateralRegistry routes redemptions across
the different collateral branches... routes BOLD redemptions to the TroveManagers of different branches in
proportion to their 'outside' debt."* Architecture MULTI-branches (plusieurs types de collatéral, chacun avec
son propre TroveManager) convergeant vers un `BoldToken` unique — encore plus de sources de mint/burn que V1
(une par branche de collatéral), plus le même trio prêt/remboursement/liquidation par branche.

**Adresse** : **NON TROUVÉE pour le mainnet** dans cette passe — seule une adresse **Sepolia (testnet)** a été
trouvée : `0x620ce1130f7c63457784cdfa31cfccbfb6be5029` — **PAS utilisable comme adresse mainnet**, signalé pour
éviter toute confusion future. **NON TROUVÉ** pour l'adresse mainnet réelle et la supply.

**Verdict provisoire BOLD : REFUSER** — architecture multi-branches = multiplication des lois de mint/burn
par rapport à USDe, encore plus net que LUSD V1.

---

## 11. GHO (renvoi vers A.3)

Mécanisme et confirmation `Transfer→0x0` + `totalSupply` déjà traités en détail en **A.3** (voir
`FAITS-memo.md`) — **CONFIRMÉ EN P1** (code source + Etherscan "Exact Match") : chaque `burn()` facilitator émet
bien `Transfer(facilitator, 0x0, amount)` et décrémente `totalSupply`. Adresse : confirmée
`0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f`.

**Supply (complément, P2/agrégateurs de prix, non daté précisément)** : figures divergentes selon la source —
CoinMarketCap/Kraken/OKX convergent autour de **~699 000 000 GHO** (699M) en circulating supply "mid-September
2026" (formulation de synthèse de l'outil de recherche, pas une date exacte vérifiée par moi sur la page
source elle-même) ; **d'autres plateformes montrent des chiffres plus bas (584M ou 527M)** selon la même
synthèse — **divergence non résolue, signalée telle quelle**. Résidu déjà noté en A.3 : les facilitators
(GSM, GhoDirectMinter, Aave Pool) n'ont pas tous été audités pour confirmer qu'ILS appellent bien `burn()` lors
d'un rachat (vs un autre chemin qui casserait C1 silencieusement).

**Verdict provisoire (rappel A.3) : MESURER** — c'est le candidat que le mémo lui-même place en premier à
mesurer (§5, §6 rang 2), et cette passe le confirme : mécanisme structurellement propre (Transfer→0x0 garanti
par le code du token, vérifié P1 déployé), résidu clairement nommé (audit des facilitators), pas de raison de
refus déjà identifiée. **Accord avec le mémo.**

---

## 12. USDS (renvoi vers A.4 + complément adresse/supply)

Mécanisme (PSM/LitePSM vs vaults CDP, ~12% CDP / ~30% réserves en stablecoins via LitePSM) déjà traité en
**A.4** (voir `FAITS-memo.md`) — **CONFIRMÉ** via ARK Invest (25 juin 2026, snapshot 11 juin 2026) : **deux
lois structurelles** (CDP vaults à taux/mécanisme différent du PSM à parité fixe USDC) — même défaut que
pointé par le mémo lui-même ("Refuser le pool. Deux clés (PSM vs vault) ou rien").

**Adresse Ethereum (complément demandé par la mission)** : `0xdC035D45d973E3EC169d2276DDab16f1e407384F` —
confirmée par DEUX sources indépendantes (Etherscan + Ethplorer, recoupées, [lu] résultats de recherche).
sUSDS (variante stakée) : `0xa3931d71877C0E7a3148CB7Eb4463524FEc27FBD` (source unique, **non recoupée** —
P2/agrégateur).

**Supply (complément)** : **"5,693,983,555"** USDS (~5,69 Md) — chiffre trouvé dans le même résultat de
recherche que le prix "$0.9997" et "106,778 transactions as of April 25, 2026", MAIS le lien entre CE chiffre
de supply précis et CETTE date (25 avril 2026) n'est **pas explicite dans le texte obtenu** — **daté avec
réserve**, à recouper directement sur Etherscan avant usage committé.

**Verdict provisoire (rappel A.4, cohérent avec le mémo) : REFUSER LE POOL — deux clés (PSM vs vault) ou
rien**, exactement la position du mémo. Accord avec le mémo, nuance déjà notée en A.4 sur le mot "majorité".

---

## Synthèse des verdicts provisoires (12 candidats)

| Candidat | Verdict provisoire | Motif principal |
|---|---|---|
| sUSDe | Refuser (même loi) | Burn réel mais cooldown ≤90j, pas 24/7 ; objet différent (déstaking ≠ rachat USD) |
| USDe bridgé (autres chaines) | Refuser | Vraisemblablement lock (pas burn) sur Ethereum canonique ; non confirmé en P1 ; mesurer une chaine locale ≠ la loi Ethena |
| USDX (Stables Labs) | Refuser | Deux voies de rachat (7j institutionnel + LP) ; depeg majeur non résorbé (≈0,0088$ au 2026-09-18) |
| USR (Resolv) | À clarifier (pencher refuser) | Fenêtre 24h (pas atomique) ; exploit 80M USR mars 2026 mélangerait burns légitimes/remédiation |
| deUSD (Elixir) | Refuser (net) | Protocole terminé (sunset), mint/redeem arrêtés, concentration ~90% sur un détenteur |
| USDtb | À clarifier | Dépendance en cascade à un tiers hors-chaine (Anchorage/BUIDL/Securitize) ; mécanisme précis non confirmé en P1 |
| USD0 (Usual) | Refuser | Deux voies de mint + deux voies de rachat (dont marché secondaire non protocolaire) |
| FRAX / frxUSD | Refuser | Deux voies de rachat, dont une plafonnée à 10 M$ de liquidité |
| crvUSD | Refuser (net) | Trois mécanismes de mint/burn indépendants (prêt, PegKeeper, liquidation) |
| LUSD (Liquity V1) | Refuser | Plusieurs lois (redemption+remboursement+liquidation) ; rachat en ETH, pas USD |
| BOLD (Liquity V2) | Refuser | Architecture multi-branches, encore plus de lois que LUSD V1 ; adresse mainnet NON TROUVÉE |
| GHO | **Mesurer** | Transfer→0x0 garanti par le code (confirmé P1 déployé) ; résidu nommé (audit facilitators), pas de défaut structurel identifié |
| USDS | Refuser le pool | Deux lois (PSM vs vault), confirmé par ARK Invest (25 juin 2026) |

**Conclusion de l'inventaire : sur 12 candidats examinés, UN SEUL (GHO) ne présente pas de défaut structurel
disqualifiant identifié dans cette passe.** Tous les autres ont soit plusieurs voies/lois de rachat, soit un
protocole arrêté/en crise non résorbée, soit un objet économique différent (déstaking, rachat en collatéral
non-USD), soit une dépendance non confirmée à un tiers hors-chaine. Ceci est cohérent avec — et renforce — le
diagnostic du mémo (§5-6) qui plaçait déjà GHO comme premier candidat "à mesurer".

---
