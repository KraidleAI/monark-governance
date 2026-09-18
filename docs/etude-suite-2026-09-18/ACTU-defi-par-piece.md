# ACTU DeFi par pièce — étude externe (registre `fleet.ts`, 11 pièces)

**STATUT** : TERMINÉ — 2026-09-18. Les 11 pièces + section transversale + rapport final sont écrits.
Dernière pièce traitée : **13. Rapport final (terminée) — archive complète, 13/13 sections.**

**Gate 0** : modèle résolu déclaré = `claude-sonnet-5` (nom "Sonnet 5"), conforme à l'attendu.
Advisor intégré : NON appelé (consigne mission + CLAUDE.md §ADVISOR "les lecteurs/chercheurs
n'appellent JAMAIS l'advisor intégré pendant une extraction").
Périmètre : EXTERNE uniquement (web public). Dossiers Downloads non lus (règle mission — un
autre chercheur indexe le corpus interne).

Discipline doc 03 appliquée : chaque fait porte URL + date de consultation + niveau
[lu] (page réellement ouverte via WebFetch et son texte extrait) / [abs] (résumé/snippet vu
seulement via WebSearch, page non ouverte) / [2nd] (mention secondaire dans une source [lu],
jamais terminale). Chiffres copiés tels quels (valeur + unité + dénominateur). Verbatim ≤ 25
mots entre guillemets. "NON TROUVÉ" consigné explicitement plutôt qu'inféré. Fenêtre "90
derniers jours" = 2026-06-20 → 2026-09-18 sauf mention contraire ; un événement hors fenêtre
cité pour contexte est marqué **[hors fenêtre]**.

Date de consultation par défaut de cette passe : 2026-09-18 (sauf mention contraire).

---

## Source du registre

Fichier lu intégralement : `F:\Monark\apps\site\lib\fleet.ts` (2026-09-18, [lu]).
11 agents de la flotte (`FLEET_AGENTS`), statut `built` = {Shōgen, Hikae, Ukemi, Narabi} (4),
`upcoming` = {Mokugeki, Kaihi, Kessai, Kamae, Kyokusen, Koyomi, Genkan} (7). Lignes `line:`
citées telles quelles dans chaque section ci-dessous comme définition de périmètre.

---

## Sommaire

1. Shōgen — attested price testimony **[terminé]**
2. Hikae — coverage-controlled gate **[terminé]**
3. Ukemi — liquidation-cascade survival **[terminé]**
4. Narabi — redemption-run velocity (USDe) **[terminé]**
5. Mokugeki — attested facts from a document/event **[terminé]**
6. Kaihi — exit a liquidity range ahead of toxic flow (LVR) **[terminé]**
7. Kessai — route a swap, settlement receipt, best execution **[terminé]**
8. Kamae — quote both sides from inventory, market making **[terminé]**
9. Kyokusen — yield curve across maturities, rollovers, looped positions, Pendle **[terminé]**
10. Koyomi — flatten leveraged exposure ahead of weekend window closure (HIP-3 / hours gap) **[terminé]**
11. Genkan — commit/defer/abstain transaction gate **[terminé]**
12. Transversal (a) agents × DeFi / MCP / x402 ; (b) réglementaire MiCA / GENIUS Act / CRA art. 14 **[terminé]**
13. Rapport final (sha256, verdicts, convergences, non sourcé) **[terminé]**

---

## 1. Shōgen — "Attested perception — a verified price testimony." (rôle sensor, **built**)

### 1.1 Le problème réel aujourd'hui

La manipulation de prix d'oracle est la catégorie de hack DeFi qui croît le plus vite en 2026,
avec plusieurs incidents dans la fenêtre des 90 jours :

- **Nostra Finance (Starknet), 17 septembre 2026, 13:28 UTC — ~3,5 M$** : un compte a exploité
  un « manipulated NSTR oracle price » pour traiter ses holdings NSTR comme collatéral gonflé ;
  marché suspendu, post-mortem promis, fournisseur d'oracle au moment de l'attaque non confirmé
  par l'article. Verbatim : « a manipulated NSTR oracle price enabled one account to treat its
  NSTR holdings as inflated collateral. » Source :
  [cryptotimes.io, 2026-09-18](https://www.cryptotimes.io/2026/09/18/nostra-halts-starknet-money-market-after-3-5m-nstr-oracle-exploit/)
  [lu]. Un second récit (WebSearch, non ouvert) situe le mécanisme comme un faux pool
  NSTR/SolvBTC à liquidité minimale + wash trading, prix poussé ~8000x (0,006 $ → 49,5 $) — via
  [coingabbar.com](https://www.coingabbar.com/en/nostra-oracle-exploit-news-nstr-token-price-manipulation)
  **[abs]**, non recoupé avec une source [lu] : à traiter comme non confirmé.
- **Moonwell (Base), 27 août 2026 — 8,7 M$ (8 728 318 DAI)** : prix spot du token de gouvernance
  MAMO gonflé ~8x (≈0,011 $ → ≈0,088 $) via trading contre des pools AMM à faible liquidité
  (Aerodrome SlipStream, Uniswap) ; collatéral surévalué utilisé pour emprunter des actifs réels.
  Verbatim : « Thursday's attack is Moonwell's third oracle-class security incident in under
  twelve months. » Le même article rapporte qu'un précédent incident (mauvaise configuration
  d'oracle cbETH, février 2026) avait accumulé 1 779 044 $ de mauvaise dette sur 181
  emprunteurs avant que le « risk manager » de Moonwell ne réduise le plafond d'emprunt à 0,01.
  L'identité du risk manager (Gauntlet a un dashboard public pour Moonwell) n'est pas confirmée
  dans l'article. Source :
  [techtimes.com, 2026-08-27](https://www.techtimes.com/articles/325839/20260827/moonwell-oracle-exploit-exceeds-full-annual-revenue-third-failure-11-months.htm)
  [lu]. Perte qui dépasse le revenu annuel total de frais du protocole (8,6 M$, même source).
- **Ostium (Arbitrum, perps), 15 juillet 2026 — 18 M$ USDC** : l'attaquant a utilisé un
  « registered PriceUpKeep forwarder » (composant d'automatisation de flux de prix, Gelato) pour
  soumettre des rapports de prix d'oracle horodatés dans le futur, rendant des trades perdants
  profitables. Verbatim : « the attacker leveraged a registered PriceUpKeep forwarder...to
  submit oracle price reports with future-dated timestamps. » Détecté/rapporté par Blockaid ;
  aucune déclaration officielle d'Ostium, Chainlink, Pyth ou Gelato dans l'article. Source :
  [coindesk.com, 2026-07-15](https://www.coindesk.com/business/2026/07/15/ostium-suffers-usd18-million-exploit-as-oracle-attack-wave-continues-to-hit-defi)
  [lu].
- **Tectonic (Cronos), 30 août 2026 — 75 M$ (TRM Labs, "proceeds échappés/gelés") / ~120 M$
  (CertiK, "impact total incident")** : token TONIC à faible liquidité manipulé ~100x en ~20
  minutes. Verbatim TRM Labs : « The attacker inflated the price of TONIC...by roughly 100x in
  about 20 minutes. » Troisième plus gros exploit de manipulation de prix jamais enregistré,
  derrière Cetus (mai 2025) et Mango Markets (octobre 2022, [2nd] via TRM). Source :
  [trmlabs.com, 2026-08-31](https://www.trmlabs.com/resources/blog/number-of-price-manipulation-attacks-hits-all-time-high-as-usd-75-million-is-stolen-from-tectonic)
  [lu]. **Contradiction consignée (règle doc 03 §7)** : deux chiffres coexistent selon la
  méthodologie (proceeds vs impact incident incluant effondrement TVL/bad debt) — piste de
  réconciliation vue en [abs] via cryptotimes.io 2026-08-31, non recoupée en détail ; les deux
  valeurs sont rapportées sans arbitrage définitif.
- **Tendance agrégée (TRM Labs, société d'analytics blockchain, classe P2)** : « TRM has
  recorded 32 price-manipulation exploits so far in 2026, more than in any previous year » —
  contre **12 pour toute l'année 2025** (« nearly triple the 12 recorded across all of 2025 »,
  via WebSearch **[abs]** sur cryptobriefing/coindesk.cc reprenant TRM, non recoupé
  directement sur trmlabs.com mais cohérent avec le chiffre "32" confirmé [lu] sur la page TRM
  elle-même). « Price manipulation now accounts for about one in eight hacks, up from one in
  17 in 2022 » [lu, trmlabs.com 2026-08-31].
- **CertiK, rapport mensuel** : pertes crypto totales août 2026 = 215 M$, dont exploits DeFi =
  144,6 M$. Source : [cryptotimes.io, 2026-08-31](https://www.cryptotimes.io/2026/08/31/crypto-losses-hit-215-million-in-august-2026-defi-exploits-certik/)
  **[abs]**, résumant un rapport CertiK non ouvert directement (P2, deux niveaux de synthèse).
- **Hors fenêtre [hors fenêtre], pour contexte d'ampleur** : Drift Protocol (Solana), 1er avril
  2026, 285 M$ — combinaison faux token + manipulation d'oracle + clé admin compromise,
  attribué par TRM Labs à des opérateurs nord-coréens (Lazarus). Source :
  [trmlabs.com via WebSearch](https://www.trmlabs.com/resources/blog/north-korean-hackers-attack-drift-protocol-in-285-million-heist)
  **[abs]**.

### 1.2 Qui s'en occupe déjà

- **Chainlink** : lecture des feeds existants gratuite ; nouveaux feeds custom sur sponsoring
  (1 000–50 000 $/mois selon chaîne/fréquence, [abs] via WebSearch synthèse, non recoupé sur
  source primaire Chainlink). 1000+ feeds, modèle push.
- **Pyth Network** : modèle pull, ~0,01 $ par mise à jour de prix on-chain payée par le
  consommateur [abs]. Segment trading haute fréquence, sub-second.
- **RedStone** : modèle pay-per-use, ~0,001–0,005 $ par point de donnée livré [abs]. Présenté
  comme l'oracle à la croissance la plus rapide en 2025-2026 (auto-évaluation RedStone blog,
  source intéressée — à pondérer).
- **Chaos Labs "Risk Oracles"** : produit commercial dédié — feeds de risque temps réel pour
  DeFi lending (ex. déployé chez Aave). Positionnement proche d'une "attestation" de risque
  mais pas d'attestation forensique du prix lui-même. Source :
  [chaoslabs.xyz](https://chaoslabs.xyz/oracles) **[abs]**, non ouverte en détail.
- **Gauntlet** : dashboards de risque publics par protocole (ex. Moonwell) — recommandations de
  paramètres, pas d'attestation cryptographique de prix. **[abs]**.
- **Immunefi / bug bounties** : Pragma Oracle (oracle ZK) propose jusqu'à 50 000 $ de prime sur
  Immunefi pour vulnérabilités ; Immunefi revendique 140 M$+ versés sur 650+ protocoles au
  global (chiffre plateforme, non daté précisément). Source :
  [immunefi.com](https://immunefi.com/bug-bounty/pragmaoracle/) **[abs]**.

### 1.3 Où est le trou

Aucun des incumbents identifiés ne livre une **attestation post-hoc, rejouable et vérifiable**
de "quel prix a été rapporté, par quelle source, à quel instant" au moment d'un incident — les
articles sur Ostium et Nostra notent explicitement que le fournisseur d'oracle exact ou les
détails techniques restent non confirmés publiquement après coup, ce qui est cohérent avec
l'absence d'un service de "témoignage de prix" indépendant et vérifiable. Piste technologique
identifiée pour combler ce trou : **zkTLS / web proofs** — preuves cryptographiques liant une
action on-chain à la source de donnée off-chain réelle qui l'a déclenchée. Verbatim (source
promotionnelle, à pondérer) : « zkTLS addresses structural gaps in oracle design by creating
cryptographic links between on-chain actions and the actual off-chain data sources that
triggered them. » Plus de 20 projets auraient intégré du zkTLS début 2026 (Arbitrum, Sui,
Polygon, Solana). Source : [bex.co blog, 2026-02-23](https://bex.co/blog/2026/02/23/zktls-verifiable-offchain-data-https)
et synthèse WebSearch **[abs]**, non recoupé sur source primaire zkTLS. **Verdict : trou réel,
non comblé par un produit tiers identifié dans cette passe** (aucun acteur trouvé livrant
spécifiquement une attestation forensique indépendante et rejouable de témoignage de prix,
distincte du feed lui-même).

### 1.4 Données disponibles

Les feeds Chainlink/Pyth/RedStone publient un historique on-chain public (lisible par tout
indexeur), donc en théorie rejouable gratuitement pour calibration. **Épisode held-out
nommé proposé** : l'incident **Nostra Finance du 2026-09-17 13:28 UTC** (Starknet) — données
publiques disponibles (adresses, pools, transactions) mais fournisseur d'oracle exact NON
CONFIRMÉ par la source [lu] à ce jour ; alternative si Starknet mal indexé : **Ostium
2026-07-15** (Arbitrum, PriceUpKeep forwarder, plus facile à indexer via explorateur Arbitrum
standard).

### 1.5 Signal de demande

**NON TROUVÉ** : aucune RFP, mandat DAO, ou budget spécifiquement dédié à un service
d'"attestation de témoignage de prix" indépendant n'a été identifié dans cette passe. Signal
adjacent le plus proche : les primes de bug bounty sur les oracles (Pragma Oracle, 50 000 $
max, Immunefi) et le produit commercial Chaos Labs "Risk Oracles" (déployé chez Aave, montant
non public trouvé) — mais ce sont des services de *prévention*/*paramétrage*, pas de
*témoignage forensique*. Verdict : **non démontré**.

---

## 2. Hikae — "Coverage-controlled inference — the gate itself." (rôle gate, **built**)

### 2.1 Le problème réel aujourd'hui

L'illustration la plus nette du problème est **hors fenêtre des 90 jours mais structurante**
(cause directe visible dans la fenêtre via l'absence persistante de risk steward complet) :

- **Aave perd son risk steward Chaos Labs, 6 avril 2026 [hors fenêtre]** : différend budgétaire
  — Aave Labs proposait 5 M$/an de rétention, Chaos Labs jugeait le coût réel de la couverture
  V3/V4 à ~8 M$/an (5,6 % des 142 M$ de revenu protocole 2025). Verbatim (Omer Goldberg,
  fondateur Chaos Labs) : « we are leaving because the engagement no longer reflects how we
  believe risk should be managed. » Sur la transition V4 : « History suggests these
  transitions take months and even years. The workload during the transition doesn't halve.
  It doubles. » Aucun successeur identifié dans l'article au moment du départ ; Chaos Labs
  était décrit comme « the last remaining technical contributor » après les départs de BGD
  Labs et Aave Chan Initiative. Source :
  [theblock.co, 2026-04-06](https://www.theblock.co/news/defi/2026-04-06-top-aave-risk-manager-chaos-labs-exits-amid-governance-dispute-396458)
  [lu].
- **Exploit Kelp DAO, 18-19 avril 2026, 292 M$ — [hors fenêtre], 12 jours après le départ de
  Chaos Labs** : pont LayerZero de Kelp DAO drainé de 116 500 rsETH (~18 % de l'offre en
  circulation), attribué à des acteurs proches du groupe Lazarus (Corée du Nord). Le rsETH volé
  a été déposé en collatéral sur Aave pour emprunter du WETH, créant ~190 M$ de dette
  potentiellement irrécouvrable. Verbatim (rapport d'incident Aave, cité par Coindesk) :
  « the rsETH exploit created unbacked collateral used to borrow roughly $190 million, leaving
  the protocol exposed to potential bad debt despite its systems functioning as designed. »
  Plus de 6 Md$ retirés d'Aave en 24h, poussant les pools ETH/USDT/USDC à 100 % d'utilisation.
  Initiative de restitution inter-protocoles "DeFi United" menée par Aave, >300 M$ ETH levés.
  Sources : [coindesk.com, 2026-04-19](https://www.coindesk.com/tech/2026/04/19/2026-s-biggest-crypto-exploit-kelp-dao-hit-for-usd292-million-with-wrapped-ether-stranded-across-20-chains)
  **[abs]**, [coindesk.com, 2026-04-20](https://www.coindesk.com/tech/2026/04/20/aave-could-face-up-to-usd230-million-in-losses-after-kelp-dao-bridge-exploit-triggers-defi-chaos)
  **[abs]** — non ouvertes en détail (WebSearch seulement), chiffres cohérents entre plusieurs
  titres de la même recherche donc plausibles mais non [lu].
- **Dans la fenêtre — continuité du symptôme** : le forum de gouvernance Aave montre des posts
  "Risk Stewards" de LlamaRisk quasi hebdomadaires tout au long de septembre 2026 (ajustements
  ponctuels de caps et de modèles de taux d'intérêt) — ex. 2026-09-18, 09-16, 09-15, 09-11,
  09-09, 09-07, 09-04, 08-31, 08-27 (URLs sur governance.aave.com, titres seulement, **[abs]**,
  non ouverts en détail). Ce rythme illustre un mode de gate **manuel, point-par-point**, sans
  garantie de couverture statistique formalisée.
- **Nostra (17 sept.) et Tectonic (30 août)**, déjà détaillés en §1.1, sont qualifiés par une
  synthèse [abs] (WebSearch) de « fundamental risk parameter failures: improper price oracle
  handling in Tectonic and insufficient collateral quality controls in Nostra Finance » — la
  défaillance du *gate* de collatéral, pas seulement du *capteur* de prix.

### 2.2 Qui s'en occupe déjà

- **Chaos Labs** : a fixé tous les paramètres de risque d'Aave depuis novembre 2022 « with zero
  material bad debt » jusqu'à son départ (source WebSearch **[abs]**, non recoupée en détail) ;
  toujours actif comme fournisseur de risque pour d'autres clients (portée non vérifiée cette
  passe).
- **Gauntlet** : ancien risk steward Aave, payé **1,6 M$/an** (réduit depuis 2 M$/an pour
  s'aligner sur Chaos Labs), parti en février 2024 **[hors fenêtre, 2nd/abs]** vers Morpho
  (rival lending protocol). Maintient des dashboards de risque publics (ex. Moonwell, cf. §1).
- **LlamaRisk** : devenu le risk steward principal (voire seul) d'Aave après le départ de Chaos
  Labs (WebSearch **[abs]**, "LlamaRisk became the leading crypto lending protocol's only risk
  manager in the immediate future") ; publie des recommandations de paramètres quasi
  quotidiennes sur le forum de gouvernance (URLs listées en §2.1). Budget/mandat chiffré : NON
  TROUVÉ dans cette passe.
- **Block Analitica, RiskDAO, ChainRisk** : mentionnés en passant dans les résultats de
  recherche (ex. chainrisk.xyz "DeFi Lending & Borrowing Risk Framework") mais non explorés en
  détail cette passe — présence confirmée, mandat/tarifs NON TROUVÉS.

### 2.3 Où est le trou

La littérature académique sur la **prédiction sélective / abstention conforme à garanties de
couverture** ("conformal prediction", "selective prediction", "coverage-controlled abstention")
est active en 2026 — plusieurs articles arXiv identifiés : « Conformal Selective Prediction
with General Risk Control » (arxiv.org/pdf/2603.24704), « CORA: Conformal Risk-Controlled
Agents for Safeguarded Mobile GUI Automation » (arxiv.org/pdf/2604.09155), « Selective
Conformal Risk Control » (arxiv.org/html/2512.12844v2) — tous **[abs]**, titres/résumés vus via
WebSearch, non ouverts en détail. Application explicite à la gouvernance de risque DeFi : **NON
TROUVÉE** — le résumé de recherche le dit explicitement : « The search results do not contain
specific information about applications to DeFi risk lending. » Un papier adjacent,
« Institutionalizing risk curation in decentralized credit » (Zbandut & Goldstein, arXiv
2512.11976, 2025-12-16, **[lu]** via WebFetch du PDF), traite de la curation institutionnelle
du risque de crédit décentralisé mais **ne mentionne pas** de mécanisme de couverture
statistique formelle ni Gauntlet/Chaos Labs dans les portions accessibles — pertinence
confirmée mais angle "coverage-controlled" non recoupé.

Le cas Kelp DAO/Aave est l'illustration la plus nette du trou : le système a fonctionné
« as designed » (verbatim ci-dessus) et a quand même laissé passer 190 M$ de collatéral non
garanti — signe qu'aucun mécanisme d'abstention formelle («ne pas accepter ce collatéral tant
que sa provenance n'est pas vérifiée dans une fenêtre de confiance ») n'était en place, alors
que les risk stewards humains (Chaos Labs, Gauntlet, LlamaRisk) opèrent par simulation et
proposition manuelle de paramètres postée sur un forum, pas par garantie statistique engagée.
**Verdict : trou plausible et bien illustré par l'incident, mais c'est une inférence par
absence (aucun outil "coverage-controlled" trouvé appliqué à la DeFi), pas une demande
explicitement formulée pour cette garantie précise.**

### 2.4 Données disponibles

Le forum de gouvernance Aave (governance.aave.com) publie l'historique complet, daté et public
des propositions "Risk Stewards" — rejouable gratuitement pour reconstruire une série
temporelle de décisions de paramètres face aux mouvements de marché. **Épisode held-out
nommé proposé (hors fenêtre mais le mieux documenté)** : **Kelp DAO → Aave, 18-19 avril 2026**
— chiffres publics corroborés par plusieurs titres (292 M$ total, 190 M$ d'exposition à la
mauvaise dette, 116 500 rsETH soit ~18 % de l'offre) mais aucune source n'a été ouverte en
détail ([lu]) cette passe, seulement des résumés [abs] convergents. Si un épisode DANS la
fenêtre est requis strictement : les ajustements de caps/IRM LlamaRisk de septembre 2026
(dates listées en §2.1) sont publics mais moins spectaculaires ; Nostra (17 sept.) et Tectonic
(30 août) réutilisables sous l'angle "défaillance du gate de collatéral".

### 2.5 Signal de demande

**Démontré pour la fonction générique de "risk steward payé"** : Aave a payé Gauntlet 1,6 M$/an
[abs] et a proposé 5 M$/an à Chaos Labs — que Chaos Labs jugeait lui-même insuffisant face à un
besoin réel qu'il chiffrait à ~8 M$/an (5,6 % du revenu protocole) [lu, theblock.co]. C'est un
marché réel, chiffré, avec un vrai désaccord de prix documenté.
**NON TROUVÉ** spécifiquement pour une garantie de couverture statistique formelle
(conformal/coverage-controlled) : aucun RFP ni mandat DAO trouvé demandant explicitement ce
type de garantie plutôt qu'une recommandation de paramètre point-estimate. Verdict global :
**demande démontrée pour la fonction générale de gate de risque payé ; non démontrée pour la
variante "coverage-controlled" spécifique que porte Hikae.**

---

## 3. Ukemi — "Liquidation-cascade survival." (rôle act, **built**)

### 3.1 Le problème réel aujourd'hui

Deux événements de liquidation en cascade tombent dans la fenêtre des 90 jours, avec des
chiffres qui **divergent selon la source** — ce qui est en soi une donnée sur le problème :

- **19-20 août 2026, "short squeeze"** : le marché a effacé une masse de positions courtes
  après un rebond soudain (BTC 69–71 k$, ETH +17,8 % à ~2 250-2 368 $). Les chiffres varient
  fortement selon la source, toutes vues en **[abs]** via WebSearch (non ouvertes en détail) :
  1,74 Md$ de liquidations courtes ("second-largest short squeeze on record" — spendnode.io) ;
  2,74 Md$ (cryptodaily.co.uk) ; ~2,99 Md$, "8th largest in history" (KuCoin) ; ~3 Md$
  (coindesk.com, deux titres). **Contradiction consignée (doc 03 §7)** : même événement,
  écarts de 1,74 à 3 Md$ selon méthodologie/fenêtre de mesure — non arbitré ici. Comparateur
  hors fenêtre [hors fenêtre] : le crash du 10 octobre 2025 reste le plus gros (~19 Md$ en une
  journée, **[abs]**), et celui de juin 2026 (4-6 juin, >3 Md$ de positions forcées, 272 000
  traders liquidés) est juste avant le début de la fenêtre **[hors fenêtre]**.
- **2 septembre 2026** : 367,73 M$ de liquidations en 24h toutes plateformes confondues
  (300,42 M$ longs / 67,31 M$ shorts), 90 090 traders forcés, plus gros ordre unique 11,99 M$
  (long ETHUSDT sur Binance). Déclencheur : anticipation de hausse de taux Fed (probabilité
  66 % pour le 16 septembre) sur fond de pétrole/rendements du Trésor en hausse ; BTC 80 k$ →
  76 548 $, ETH -3 % à 2 368 $. Source :
  [buildix.trade, non daté précisément dans le snippet](https://www.buildix.trade/blog/crypto-long-squeeze-september-2-2026-368m-liquidations-fed-hike-odds)
  **[abs]**, via WebSearch, non ouverte en détail.
- **Cadre académique du risque systémique inter-protocoles** : un papier SSRN (Cao & Palaash,
  non daté précisément dans le snippet) modélise le regroupement de liquidations
  cross-protocole via un processus de Hawkes multivarié sur 7 500 événements de liquidation
  on-chain (2023-2025, Aave V3/Compound V3/Morpho, Ethereum) ; « the strongest cross-protocol
  channel runs from Morpho to Compound V3 » (synthèse WebSearch **[abs]**, papier non ouvert).
  Un article de blog (classe P3, partiellement promotionnel — bex.co, à pondérer),
  [bex.co, 2026-04-19](https://bex.co/blog/2026/04/19/defi-shadow-contagion-composability-cascade-risk-model)
  **[lu]**, nomme le problème « shadow contagion » avec le verbatim : « The systemic risk
  nobody is pricing, because nobody has a map of the pipes. » Il cite deux cas
  [hors fenêtre] : le piratage Resolv USR (25 M$ initiaux → 500 M$+ de pertes en cascade,
  chiffres non recoupés indépendamment cette passe) et Drift Protocol (286 M$, cf. §1.1 où
  d'autres sources donnent 285 M$ — écart mineur non arbitré).

### 3.2 Qui s'en occupe déjà

- **DeFi Saver** : automatisation par position, multi-protocoles (Maker, Aave, Compound,
  Morpho, Liquity V2, CurveUSD). **Étude de cas chiffrée [hors fenêtre]** (25 janvier – 9
  février 2026, **[lu]**) : 365 positions à risque protégées sur Aave V3, 446,30 M$ de
  collatéral défendu sur 4 réseaux, ~8,38 M$ de frais de liquidation évités (« 100% success
  rate, completely insulating users from an estimated $8.38 million »), 382 déclenchements
  automatisés de remboursement (365 étant des interventions d'urgence, 95,55 %). Modèle de
  frais : 0,3 % par déclenchement automatisé contre 5 % de pénalité de liquidation standard.
  Exemple chiffré : position de 7 159 595,62 $ de dette sauvée pour 5 896,14 $ de frais contre
  173 093,75 $ de coût de liquidation classique (économie de 97 %). Source :
  [blog.defisaver.com](https://blog.defisaver.com/defi-saver-case-study-the-role-of-automation-during-mass-liquidation-events/)
  [lu].
- **Instadapp** : mentionné comme intégration/concurrent proche ; tarifs et volumes NON
  TROUVÉS cette passe.
- **Nexus Mutual** : assurance DeFi, produit "Protocol Cover" couvrant explicitement
  l'« oracle manipulation/failure » et la « severe liquidation failure » comme périls définis
  (aux côtés des hacks de smart contract et attaques de gouvernance). 6,5 Md$ de crypto
  "safeguarded" depuis 2019 (chiffre propre à Nexus Mutual, un autre document du même
  écosystème cite "7 Billion Covered" — écart non arbitré, **[abs]** dans les deux cas).
  Primes annuelles 2-10 %, prix dynamique via pools de staking. Sinistres réels payés pour
  l'exploit Euler Finance [hors fenêtre] : 9 réclamations Protocol Cover + 1 réclamation
  Sherlock Excess Cover, totalisant 2 389 227,88 $ (Protocol Cover) + 1 000 000 $ (Sherlock
  Excess Cover) = ~3,39 M$. Source : WebSearch **[abs]**, nexusmutual.io/medium, non ouvertes
  en détail.
- **Gauntlet, Chaos Labs** : cités par bex.co comme acteurs adressant le risque de paramètres
  par protocole (dashboards), mais pas la cartographie cross-protocole elle-même — cf. §3.3.

### 3.3 Où est le trou

L'automatisation **par position, sur un seul protocole** (DeFi Saver, Instadapp) est un espace
établi et facturé (0,3 % par déclenchement, économies documentées de 94-97 % vs liquidation
standard). L'assurance **ex-post** (Nexus Mutual, "severe liquidation failure" comme péril
couvert) est également un marché réel et pricé (primes 2-10 %/an, sinistres payés). Ce qui
n'apparaît PAS livré par ces incumbents : une **survie de cascade cross-venue, en temps réel**
— c'est-à-dire un mécanisme qui suit la propagation d'une vague de liquidations d'un protocole
à l'autre (le canal Morpho → Compound V3 identifié par la recherche académique) et agit avant
que la cascade n'atteigne une position donnée. La littérature qualifie ceci de trou nommé
(« shadow contagion », « nobody has a map of the pipes », bex.co 2026-04-19 [lu]) et la
recherche académique sur le sujet (Hawkes multivarié, interopérabilité multi-chaînes — arXiv
2605.12508, 2601.08540, tous **[abs]**, non ouverts) reste au stade modélisation, sans produit
public identifié qui la transforme en mécanisme d'action temps réel. Illustration
supplémentaire du trou : l'écart de 1,74 à 3 Md$ pour désigner LE MÊME événement du 19-20 août
2026 montre qu'il n'existe même pas de **mesure canonique et rejouable** de l'ampleur d'une
cascade — un préalable à toute "survie" mesurable. **Verdict : trou réel et bien nommé dans la
littérature (contagion cross-protocole), non comblé par un produit identifié cette passe** —
DeFi Saver/Instadapp couvrent la position isolée, Nexus Mutual couvre après coup, personne
identifié ne couvre la cascade elle-même en temps réel et de façon vérifiable/rejouable.

### 3.4 Données disponibles

Les événements de liquidation on-chain sont publics et indexables (le papier SSRN a utilisé
7 500 événements 2023-2025 sur Aave V3/Compound V3/Morpho) ; agrégateurs publics existent
(CoinGlass, CoinMarketCap Liquidations Dashboard) mais avec des méthodologies visiblement
disjointes (cf. écart 1,74-3 Md$ ci-dessus). **Épisode held-out nommé proposé** : **19-20 août
2026** (short squeeze, in-window, données riches mais contradictoires — bon test pour une
mesure rejouable qui réconcilierait ou justifierait l'écart) ; alternative plus propre/precise :
**2 septembre 2026** (367,73 M$, 90 090 traders, chiffres plus granulaires et cohérents dans
la source consultée).

### 3.5 Signal de demande

**Démontré pour l'automatisation de position unique** : DeFi Saver facture réellement 0,3 % par
déclenchement et documente 8,38 M$ économisés sur une seule campagne [hors fenêtre] — modèle
d'affaires vivant et mesuré. **Démontré pour l'assurance ex-post** : primes Nexus Mutual 2-10 %
/an, sinistres réels payés (~3,39 M$ pour Euler Finance). **NON TROUVÉ** spécifiquement pour un
produit de "survie de cascade cross-venue" : aucune RFP, mandat DAO ou budget nommé pour
cartographier/agir sur la contagion cross-protocole en temps réel n'a été identifié — bex.co
utilise le problème pour promouvoir sa propre infrastructure RPC/data, ce qui suggère un
intérêt commercial naissant mais pas un mandat confirmé. Verdict global : **demande démontrée
pour les catégories adjacentes (automatisation mono-position, assurance ex-post) ; non
démontrée pour la survie de cascade cross-venue spécifique que porte Ukemi.**

---

## 4. Narabi — "senses redemption-run velocity from the attested onchain flow; its adaptive quantile tracker publishes a replayable daily timeline." (rôle sensor, **built**, cible USDe)

### 4.1 Le problème réel aujourd'hui

- **USDe résiste au trou d'air du marché de la fenêtre, contrairement au marché stablecoin
  global** : l'offre totale de stablecoins est passée d'un pic de ~322,121 Md$ mi-mai 2026 à
  ~307,561 Md$ au 2 août 2026 (recul de ~14,56 Md$ en moins de 3 mois, "biggest drop since
  Terra" selon le titre), attribué en partie au GENIUS Act (signé juillet 2025) qui interdit
  aux émetteurs de stablecoins de paiement agréés de verser un rendement, poussant le capital
  vers les bons du Trésor tokenisés (~17 Md$). **USDe a fait l'inverse** : +5,13 % à 4,59 Md$
  (~+224 M$ d'offre) à la mi-septembre 2026. Source : WebSearch **[abs]**
  (news.bitcoin.com / coininsider.org / gncrypto.news, non ouvertes en détail), 2026-08-04.
- **Correction de datation importante** : un article largement titré comme actualité 2026
  ("USDe Supply Plummets $800 Million in 72 Hours") décrit en réalité un événement du
  **10-13 mars 2025** (offre 4,2 Md$ → 3,4 Md$, -19 %) — **[hors fenêtre, daté à tort par le
  titre]**. Cause identifiée : demandes de rachat > demandes de mint, pas un échec de peg.
  Verbatim : « A declining supply is a market-driven phenomenon, whereas a de-pegging event
  signals a failure of the stabilizing mechanism. » Détecté via CryptoQuant (analytics on-chain
  tierce). Source : [cryptonews.net](https://cryptonews.net/news/defi/32749579/) [lu]. Leçon
  méthodologique consignée : vérifier systématiquement l'année réelle des événements, pas
  seulement le domaine/millésime apparent de l'article.
- **Événement fondateur (hors fenêtre) qui structure la réponse actuelle d'Ethena** : le crash
  du **10 octobre 2025** a fait perdre à USDe « over $5 billion » de capitalisation quand les
  investisseurs se sont précipités pour racheter ; le capital déployé en positions a chuté « to
  $791 million, a decline of over 85% ». Au début 2025, ~93 % du collatéral USDe était en
  positions perpétuelles ; la composition a été profondément réallouée depuis (cf. §4.2).
  Source : [thedefiant.io](https://thedefiant.io/news/defi/ethena-proposes-replacing-7-day-susde-unstaking-period-with-dynamic-cooldown)
  [lu].
- **Mécanique de contrainte en cas de rachat massif, dans la fenêtre** : limite de rachat de
  **10 M$ par bloc** (au moment de l'analyse LlamaRisk) créant un risque de timing lors de
  sorties extrêmes, pouvant forcer les utilisateurs à accepter une perte de peg plutôt que
  d'attendre. Source : [llamarisk.com, "Ethena Reserve Fund Drawdown Methodology V2"](https://www.llamarisk.com/research/ethena-drawdown-methodology-v2)
  **[abs]**, non ouverte en détail.
- **NON TROUVÉ** : un incident USDe spécifiquement daté et chiffré DANS la fenêtre du
  2026-06-20 au 2026-09-18 (dépeg, rachat massif ponctuel). Ce qui est trouvé dans la fenêtre
  est la tendance de fond (USDe croît pendant que le marché stablecoin global se contracte) et
  la mécanique de réponse structurelle (cooldown dynamique), pas un épisode de stress isolé et
  daté.

### 4.2 Qui s'en occupe déjà

- **Ethena (émetteur)** : dashboard "Transparency" propre (app.ethena.fi/dashboards/transparency)
  avec attestations mensuelles de custodians tiers ; Reserve Fund (~62 M$, ~1,4 % de l'offre
  USDe, épuisable en ~52 jours sous test de stress V1 propre au protocole — source
  llamarisk.com **[abs]**). **Réponse structurelle post-crise (proposition #759, "dynamic
  cooldown")** : remplace le cooldown fixe de 7 jours par une durée à paliers (1/3/5/7 jours)
  indexée sur la part d'actifs liquides du collatéral. Verbatim (X/Twitter Ethena, cité par
  WebSearch **[abs]**) : « Cooldown periods will vary between 1-7d periods going forward based
  on the composition of USDe backing in more liquid assets. » Déclencheur automatique
  d'extension (via thedefiant.io [lu]) : si les demandes journalières de unstaking dépassent 2x
  la moyenne mobile 14 jours ET que la couverture à 3 jours tombe sous 1,5x, le cooldown
  s'allonge d'un jour. Statut d'implémentation on-chain (2026-07-15, durée constatée = 1 jour,
  le plancher du mécanisme) : vu uniquement en **[abs]** via synthèse WebSearch, non recoupé
  directement sur une source primaire Ethena dans cette passe.
- **Blockworks Analytics — "Ethena: USDe (Risk)"** : dashboard tiers dédié, suit le "liquid
  cash by tier" (paliers 1/2/5 jours), le "cooldown redemption cap", le "liquid coverage
  ratio", le **"queue pressure" et "queue pressure ratio"** (volume de demandes de unstaking en
  attente vs capacité de traitement journalière), un "recommended cooldown", et un "stress
  endurance" (jours de tenue au rythme de sorties actuel). Verbatim : « This dashboard monitors
  the liquidity conditions that determine sUSDe unstaking periods. » Statut payant/gratuit NON
  TROUVÉ. Source : [blockworks.com/analytics/ethena/ethena-risk-usde](https://blockworks.com/analytics/ethena/ethena-risk-usde)
  [lu]. **Ne montre PAS**, d'après la lecture, de vélocité de rachat simple ni de chronologie
  quotidienne rejouable — c'est un tableau de bord d'état courant/prospectif, pas un journal
  historique rejouable.
- **LlamaRisk** : engagé par Ethena pour la méthodologie de stress-test du Reserve Fund
  ("Drawdown Methodology V2") — mandat de recherche de risque documenté publiquement (montant
  non trouvé). Source : llamarisk.com **[abs]**.
- **Dune (communautaire, gratuit)** : au moins 4 dashboards distincts identifiés (chairmanda0x,
  entropy_advisors ×3 pour USDe/sUSDe/USDtb, noxiousq) — données on-chain publiques mais
  dashboards communautaires non garantis/non audités. **[abs]**, non ouverts en détail.
- **TID Research, Pharos, Hindenrank** : rapports de risque tiers sur sUSDe/Ethena (ex.
  Hindenrank note "Grade C, $3.8B TVL" pour Ethena) — **[abs]**, non ouverts, gratuité/paiement
  NON TROUVÉ.
- **Immunefi** : bug bounty Ethena, jusqu'à 3 M$ pour un bug critique de smart contract
  (10 % des fonds affectés, plafonné). Source : [immunefi.com](https://immunefi.com/bug-bounty/ethena/information/)
  **[abs]**.

### 4.3 Où est le trou

Le dashboard Blockworks est l'incumbent le plus proche fonctionnellement (queue pressure,
stress endurance, recommended cooldown) mais, d'après la lecture directe de sa description, il
livre un **état courant/prospectif**, pas une **vélocité de rachat en quantiles adaptatifs avec
chronologie quotidienne rejouable** (la formulation exacte de la ligne `fleet.ts`). Le mécanisme
"dynamic cooldown" d'Ethena lui-même est une **réponse mécanique interne au protocole** (ajuste
une durée de blocage), pas un **capteur indépendant et publiquement rejouable** de la vitesse de
rachat. Aucun des acteurs identifiés (Ethena, Blockworks, LlamaRisk, Dune communautaire) ne
publie explicitement un « replayable daily timeline » au sens propre du terme. **Verdict : trou
plausible et assez bien délimité** — le "quoi" (surveillance de la liquidité/cooldown) est déjà
couvert par Blockworks, mais le "comment" spécifique (vélocité en quantiles adaptatifs,
rejouable jour par jour, indépendant de l'émetteur) n'a pas été trouvé chez un tiers dans cette
passe. Prudence : Blockworks pourrait déjà couvrir une partie substantielle de ce terrain sans
que la lecture (non approfondie, page de description seulement) ait exposé tous les onglets du
produit — à vérifier plus avant si une décision d'investissement en dépend.

### 4.4 Données disponibles

Fortement disponibles et gratuites : évènements de mint/redeem USDe on-chain sont publics
(contrats Ethena), déjà exploités par au moins 4 dashboards Dune communautaires distincts et par
Blockworks. Attestations mensuelles de custodians tiers publiées par Ethena elle-même
(app.ethena.fi/dashboards/transparency). **Épisode held-out nommé proposé** : le week-end du
**10 octobre 2025** [hors fenêtre mais le mieux chiffré et le plus cité comme référence par
l'écosystème lui-même — cf. §4.1] — perte de >5 Md$ de capitalisation USDe, effondrement du
capital déployé en positions de 85 %+ vers un plancher de 791 M$ ; c'est l'épisode que le
mécanisme de cooldown dynamique d'Ethena a été conçu pour absorber, donc un bon test de
rejouabilité. Alternative strictement dans la fenêtre : NON TROUVÉ d'épisode de stress USDe
isolé et daté ; à défaut, la série continue de croissance d'offre USDe de juin à septembre 2026
(source ci-dessus) reste disponible et rejouable comme "régime calme" de comparaison.

### 4.5 Signal de demande

**Partiellement démontré** : Ethena engage LlamaRisk pour une méthodologie de risque dédiée
(Reserve Fund Drawdown V2) — mandat réel mais montant NON TROUVÉ. Programme de bug bounty
Immunefi chiffré (jusqu'à 3 M$). Existence d'un dashboard tiers gratuit chez Blockworks
(financement du dashboard NON TROUVÉ — modèle Blockworks Analytics probablement freemium/
abonnement recherche, non vérifié cette passe). **NON TROUVÉ** : RFP ou mandat explicitement
formulé pour un "tracker de vélocité de rachat en quantiles adaptatifs, rejouable" — la demande
existe pour la fonction large (surveillance de liquidité/risque de rachat) mais pas nommément
pour la forme précise que revendique Narabi. Verdict global : **demande démontrée pour la
fonction de surveillance de risque de rachat en général (mandats LlamaRisk, bounty Immunefi) ;
non démontrée pour la forme spécifique "vélocité + quantiles adaptatifs + rejouable".**

---

## 5. Mokugeki — "attests the facts it extracts from a document or an event, without adding sentiment or interpretation." (rôle sensor, **upcoming**)

### 5.1 Le problème réel aujourd'hui

- **Crise de résolution Polymarket/UMA, échelle 2026** : plus de **1 150 marchés disputés
  enregistrés au premier semestre 2026**, dépassant déjà le total de l'année 2025 complète
  (WebSearch **[abs]**, non ouvert en détail — période très majoritairement [hors fenêtre] mais
  alimentant la tendance visible dans la fenêtre). Une enquête du Wall Street Journal (mai 2026,
  **[hors fenêtre]**, **[abs]**) aurait établi que sur la plupart des marchés disputés, plus de
  la moitié des votes UMA proviennent des dix plus gros portefeuilles, qu'au moins 60 % des
  votants UMA actifs seraient liés à des comptes Polymarket actifs, et qu'environ un cinquième
  des disputes impliquerait au moins un votant ayant un intérêt financier dans le contrat qu'il
  juge.
- **Cas concret, à la frontière de la fenêtre — marché "MicroStrategy sells any Bitcoin by May
  31, 2026?"** : marché à **60 M$ de volume** (texte de l'article) — à noter, l'URL de
  l'article porte "usd85m" dans son slug, une **incohérence interne à la source non résolue**
  (le corps du texte dit 60 M$, l'URL suggère 85 M$ ; consignée sans arbitrage, doc 03 §7).
  Chronologie : vente de 32 BTC entre le 26 et le 31 mai 2026 (prix moyen 77 135 $), dépôt d'un
  8-K le 1er juin 2026 révélant la vente, litige envoyé à un vote UMA pondéré par les tokens
  après que deux propositions "No" aient été contestées — **le désaccord ne porte pas sur le
  fait (BTC vendu, quantité, date) mais sur l'interprétation de la règle** : « whether the rule
  requires public disclosure inside the month or only on-chain execution inside the month. »
  Vote probablement situé début-mi juin 2026, donc **à la limite ou juste avant** le début de
  la fenêtre des 90 jours (2026-06-20) — daté avec incertitude, non confirmé précisément. Source :
  [thedefiant.io](https://thedefiant.io/news/markets/usd85m-polymarket-dispute-over-strategy-s-may-bitcoin-sale-puts-uma-s-token-voting-oracle-on)
  [lu].
- **Source académique la plus solide, DANS la fenêtre** : Maksym Nechepurenko, « Resolution Is
  Not Settlement, Part I: Oracle Adjudication and Semantic Governance on Polymarket », arXiv
  2609.15368, publié **2026-09-14** [lu]. Distingue formellement la "résolution" (déterminer ce
  qui s'est passé) du "règlement" (distribuer les paiements), et traite les étapes de
  l'adjudication ("rule versioning, request creation, proposal, dispute, reset, Oracle
  finality, adapter terminality") comme des états distincts à suivre précisément. Verbatim :
  « Request age is not semantic resolution age. » Le papier reconstruit le comportement de
  l'oracle Polymarket à partir des logs d'événements blockchain publics (« event-sourced
  account of Oracle adjudication ») mais **ne propose aucune architecture alternative** — c'est
  un diagnostic, pas un produit. Source : [arxiv.org/abs/2609.15368](https://arxiv.org/abs/2609.15368)
  [lu].
- **Précédent hors fenêtre, pour échelle** : en mars 2025, un détenteur contrôlant ~5 millions
  d'UMA via trois portefeuilles aurait exprimé ~25 % du vote sur un marché de 7 M$, le
  résolvant contre la lecture directe des faits (WebSearch **[abs]**, non recoupé).
- **Contexte réglementaire adjacent (à ne pas confondre avec MiCA/GENIUS/CRA, cf. §12)** : la
  CFTC aurait déposé des mémoires d'amicus curiae en février 2026 **[hors fenêtre]** dans un
  litige de préemption fédérale impliquant au moins 12 États sur la question de savoir si les
  marchés de prédiction sont des paris illégaux (régulation étatique) ou des dérivés relevant
  du Commodity Exchange Act (CFTC). Statut au 2026-09-18 : NON VÉRIFIÉ si le litige est toujours
  actif dans la fenêtre — signalé comme piste, pas comme fait daté dans la fenêtre.

### 5.2 Qui s'en occupe déjà

- **UMA Optimistic Oracle (via Polymarket)** : caution de proposition typique de **750 USDC.e**
  pour une fenêtre de "liveness" de 2h ; un disputeur doit poster une caution équivalente ; le
  camp perdant confisque sa caution. Pour les disputes plus importantes, un schéma à cautions
  plus élevées existe (10 000 USDC côté proposeur + 5 000 USDC côté disputeur, le gagnant
  proposeur recevant 15 000 USDC, la "Store" recevant 5 000 USDC). Suite aux abus, UMA a
  restreint la proposition à une liste blanche (« a managed version of the Optimistic Oracle
  that restricts proposing to a whitelist »). Source : WebSearch **[abs]** (startpolymarket.com
  et sources associées), non ouvertes en détail.
- **Polymarket (rédaction des règles)** : source structurelle de l'ambiguïté dans le cas
  MicroStrategy — les règles de marché elles-mêmes laissent une place à l'interprétation que
  le vote UMA doit ensuite trancher.
- **Recherche académique indépendante** : Nechepurenko (arXiv, sept. 2026) reconstruit
  l'historique d'adjudication à partir des logs publics — travail analytique, pas un service en
  production.
- **Infrastructures d'IA vérifiable (zkML), généralistes, pas spécifiques aux marchés de
  prédiction** : Chainlink ("What is Verifiable AI?"), ARPA, zkm.io ("Proof of Inference") —
  toutes **[abs]**, non ouvertes en détail. Limite explicitement documentée par la synthèse de
  recherche : « a proof shows a model ran correctly on given inputs, but it cannot confirm
  those inputs reflect reality, which is the oracle problem carried into AI » — et le coût de
  preuve reste un obstacle pratique en 2026 (« proving cost and latency leading the list »).

### 5.3 Où est le trou

Le papier académique de septembre 2026 **nomme le problème avec précision** (résolution ≠
règlement, âge de la requête ≠ âge de résolution sémantique) mais **ne propose aucun produit**
qui sépare l'attestation factuelle brute (ce qui s'est passé, sourcé, daté) de la couche
d'adjudication interprétative (comment la règle du marché s'applique à ce fait). Le mécanisme
UMA actuel **fusionne les deux** : son vote pondéré par les tokens tranche simultanément le fait
et son interprétation, ce que l'enquête WSJ et le cas MicroStrategy illustrent concrètement (le
fait — 32 BTC vendus, à quelle date, à quel prix — n'était pas contesté ; seule l'application de
la règle l'était). Les infrastructures zkML/IA vérifiable, même une fois matures, sont
explicitement documentées comme ne résolvant PAS ce problème (elles attestent qu'un calcul a eu
lieu correctement, pas que les données d'entrée reflètent la réalité). **Verdict : trou réel,
bien documenté et daté (papier académique du 2026-09-14, dans la fenêtre), non comblé par un
produit identifié** — ni par UMA (vote, pas attestation séparée), ni par le zkML généraliste
(attestation de calcul, pas de vérité empirique), ni par la recherche académique elle-même (qui
diagnostique sans construire).

### 5.4 Données disponibles

Les logs d'événements on-chain de l'oracle UMA/Polymarket sont publics et ont déjà servi de
base à une reconstruction académique complète (« event-sourced account »), donc rejouables et
gratuits par construction. **Épisode held-out nommé proposé** : le marché **"MicroStrategy
sells any Bitcoin by May 31, 2026?"** (26-31 mai 2026 pour le fait sous-jacent, 1er juin pour le
8-K, vote UMA situé autour de début-mi juin 2026 — daté avec incertitude, à la limite de la
fenêtre) — cas pédagogique idéal car le fait et l'interprétation sont clairement séparables et
documentés. **NON TROUVÉ** cette passe : un épisode de dispute strictement DANS la fenêtre
(après le 2026-06-20) avec chiffres complets et sourcés — limite explicite de cette passe à
signaler.

### 5.5 Signal de demande

Un marché réel, chiffré et appliqué économiquement existe pour la **prise de risque
d'adjudication** (cautions UMA de 750 à 15 000+ USDC selon la taille du marché, perdant
confisqué) — mais c'est un marché de pari sur l'issue du vote, pas un marché pour un service
d'attestation factuelle pure et séparée. **NON TROUVÉ** : aucune RFP, subvention ou mandat
identifié spécifiquement pour un produit d'attestation de faits sans interprétation, distinct
de l'oracle d'adjudication. L'intérêt académique (papier dédié, sept. 2026) et journalistique
(enquête WSJ) démontre que le problème est reconnu et documenté publiquement, mais aucun
paiement/mandat n'a été trouvé pour la forme précise que porte Mokugeki. Verdict global :
**problème vivant et bien documenté académiquement ; demande non démontrée** pour la solution
spécifique.

---

## 6. Kaihi — "exits a liquidity range — minting or burning it — ahead of toxic order flow." (rôle act, **upcoming**)

### 6.1 Le problème réel aujourd'hui

- **LVR (loss-versus-rebalancing), quantification fondatrice [hors fenêtre mais référence
  académique toujours citée]** : le papier fondateur a16z crypto (2022-09-18, **[lu]**)
  chiffre : « If a Uniswap v2 ETH-USDC pool has a daily volatility of 5%, then LPs lose 3.125
  bps to LVR every day (for a roughly 11% loss annually). » Le LVR croît de façon quadratique
  avec la volatilité (σ²) ; avec des frais de 30 bps et 5 % de volatilité quotidienne, les LP
  atteignent leur seuil de rentabilité si le volume journalier atteint ~10,4 % des actifs de
  l'AMM. Recommandations propres au papier : frais dynamiques, intégration d'un oracle de prix
  de haute qualité — sans nommer de protocole précis.
- **Chiffre convergent, source intéressée (CoW DAO, [abs])** : « CoW AMM LPs don't have to
  worry about LVR, which costs CF-AMM LPs 5-7% of their liquidity, on average. » Ordre de
  grandeur cohérent avec l'estimation a16z (~11 %/an dans un scénario spécifique), méthodologie
  non recoupée — les deux chiffres sont rapportés sans arbitrage (doc 03 §7).
- **Épisode dans la fenêtre, échelle du problème de flux toxique/MEV** : le 21 juin 2026 (tout
  début de la fenêtre), le plus gros bot de "sandwich" d'Ethereum (jaredfromsubway.eth) a
  lui-même été drainé de **7,5 M$** — l'attaquant a déployé pendant plusieurs semaines de faux
  contrats de tokens et pools imitant WETH/USDC/USDT, laissant des approbations ouvertes que le
  bot a fini par exploiter lui-même comme "opportunité de trading". Verbatim : « The attacker
  created routes where the approvals stayed open. » Le même article rapporte (chiffres [2nd],
  la source citant elle-même une autre analyse, période très majoritairement hors fenêtre,
  nov. 2024-oct. 2025) : « Sandwich attacks cost Ethereum traders about $60 million a year »,
  jaredfromsubway.eth représentant ~70 % des attaques sandwich, à une fréquence de 60 000 à
  90 000 attaques par mois. Source :
  [coindesk.com, 2026-06-21](https://www.coindesk.com/tech/2026/06/21/ethereum-s-biggest-sandwich-bot-drained-of-usd7-5-million-in-ironic-exploit)
  [lu].
- **Épisode adjacent dans la fenêtre, mécanisme différent (à ne pas confondre avec du LVR pur)**
  : More Markets (Flow EVM), 31 août 2026, 9,3 M$ — un attaquant a vidé la réserve WFLOW du
  marché mFlowWFLOW via une position de liquid-staking Ankr bondée et le mode E-Mode (15,5 M
  WFLOW retirés). Mentionné pour mémoire comme perte DeFi de la fenêtre mais ce n'est pas un
  cas de LVR/flux toxique au sens de Kaihi — c'est un exploit de paramètres de prêt/collatéral,
  plus proche des sujets §1-2. Source : WebSearch **[abs]**, non ouverte en détail.

### 6.2 Qui s'en occupe déjà

- **Arrakis Finance** : gestion automatisée de position de liquidité (vaults) sur Uniswap v3 et
  au-delà ; « manages liquidity for over 100 token issuers » et « more than $5B in onchain
  volume » facilité (chiffres cumulés, non datés précisément). Modèle de frais : 1 % de l'AUM +
  50 % des frais générés sur certains services de gestion de liquidité. Produits : Arrakis
  V2 (vaults LP automatisés pour déposants) et **PALM** (Protocol Automated Liquidity
  Management, marque blanche pour trésoreries de protocoles). Source : WebSearch **[abs]**
  (defillama.com, arrakis.finance, docs.arrakis.finance), non ouvertes en détail.
- **Gamma (Strategies)** : cité comme protocole de gestion de liquidité distinct et concurrent
  d'Arrakis, mais NON EXPLORÉ en détail cette passe — tarifs/AUM NON TROUVÉS. Limite de
  sourcing explicitement signalée.
- **Gauntlet** : propose une ligne "Uniswap ALM Analysis" (Automated Liquidity Management) —
  encore une verticale Gauntlet distincte de ses activités de risk steward vues en §1-2.
  **[abs]**, non ouverte en détail.
- **CoW AMM (CoW DAO, déployé sur Balancer)** : approche structurellement différente — élimine
  le LVR par construction via des enchères par lots (batch auctions) à un prix de compensation
  uniforme, redirigeant le surplus d'arbitrage vers les LP plutôt que vers des bots externes.
  Rétro-test (6 mois de données 2023, source CoW DAO **[abs]**, intéressée) : les rendements
  CoW AMM auraient égalé ou dépassé ceux d'un AMM à fonction constante classique sur 10 des 11
  paires non-stables les plus liquides. **Différence structurelle importante à noter** : CoW
  AMM est une AMM alternative où migrer la liquidité, pas un outil qui s'ajoute par-dessus une
  position Uniswap v3/v4 existante.
- **Hooks Uniswap v4 de minimisation de LVR** : espace de recherche actif mais au stade
  hackathon/forum — un hook "LVR Minimizing Hook" référencé sur ETHGlobal, un article "Dynamic
  Beta Optimization" (Medium/Decipher Media), plusieurs fils ethresear.ch dédiés (« LVR
  Minimization in Uniswap V4 », « Per-block conversion vs. Futures contracts »). Principe :
  position unique par pool, rebalancée après chaque swap selon la volatilité historique.
  Financé en partie par le programme de subventions Uniswap Foundation (montant précis pour la
  recherche LVR NON TROUVÉ ; le programme global a "committed $26M in grants during 2025" et
  détenait 85,8 M$ en fin d'année — source [coindesk.com, 2026-04-01](https://www.coindesk.com/business/2026/04/01/uniswap-foundation-held-usd85-8m-at-year-end-committed-usd26m-in-grants-during-2025)
  **[abs]**).

### 6.3 Où est le trou

Les incumbents se répartissent en deux familles distinctes, ni l'une ni l'autre ne correspondant
exactement à la formulation de Kaihi ("sort d'une range **avant** un flux toxique") : (a) les
gestionnaires de vaults LP réactifs (Arrakis, Gamma, l'analyse ALM de Gauntlet) qui replacent
des ranges selon un calendrier ou un déclencheur de volatilité — optimisation, pas
nécessairement anticipation d'un flux toxique identifié à l'avance ; (b) les AMM redessinées
qui éliminent structurellement le LVR (CoW AMM) — mais qui exigent de migrer la liquidité vers
un mécanisme entièrement différent, pas un outil applicable à une position Uniswap v3/v4
existante. Les hooks Uniswap v4 de minimisation de LVR sont la piste conceptuellement la plus
proche de Kaihi (rebalancement actif post-swap selon la volatilité) mais restent, d'après les
sources trouvées, à un stade **recherche/hackathon** (ETHGlobal, forums ethresear.ch) plutôt
qu'un produit géré à l'échelle d'Arrakis. **Verdict : trou plausible entre la gestion réactive
établie (Arrakis/Gamma) et la recherche de hooks encore émergente** — mais cette conclusion
reste fragile car Gamma Strategies, le concurrent direct le plus cité d'Arrakis, n'a pas été
exploré en détail cette passe (limite explicite : le "trou" pourrait déjà être partiellement
comblé par un produit Gamma non vérifié ici).

### 6.4 Données disponibles

Les données de pool Uniswap (réserves, swaps, prix) sont publiques via subgraph et directement
utilisées pour calculer le LVR dans la littérature académique (papier a16z 2022, plusieurs
articles arXiv 2026 identifiés : "Bounding LVR in AMMs via Secant-Tangent Divergence..."
arxiv.org/abs/2605.19267, "Optimal Block Time for AMM Liquidity Providers under Jump-Diffusion
Prices" — tous **[abs]**, non ouverts en détail). **Épisode held-out nommé proposé** : le
drainage du bot jaredfromsubway.eth du **2026-06-21** — intéressant comme test inversé (les
extracteurs de flux toxique eux-mêmes victimes d'un flux/schéma anormal), données publiques
via l'explorateur Ethereum. **NON TROUVÉ** cette passe : un épisode isolé, chiffré et daté DANS
la fenêtre où des LP identifiés perdent un montant précis spécifiquement au LVR (par
opposition aux statistiques agrégées a16z/CoW AMM, qui sont utilisables pour calibration mais
ne sont pas un épisode unique rejouable).

### 6.5 Signal de demande

**Démontré pour la gestion de liquidité automatisée en général** : Arrakis facture réellement
1 % d'AUM + 50 % des frais et revendique plus de 5 Md$ de volume on-chain facilité pour 100+
émetteurs de tokens — marché réel et actif. Le programme de subventions Uniswap Foundation est
réel et large (26 M$ engagés en 2025) et finance en partie la recherche MEV/LVR, mais **aucun
montant précis fléché spécifiquement "LVR" n'a été confirmé** cette passe. **NON TROUVÉ** :
mandat ou RFP explicitement formulé pour un mécanisme de **sortie préventive de range avant
un flux toxique identifié**, distinct de la gestion réactive (Arrakis/Gamma) ou de la
refonte structurelle (CoW AMM). Verdict global : **demande démontrée pour les catégories
adjacentes (gestion de liquidité automatisée facturée, subventions de recherche MEV/LVR) ; non
démontrée pour la forme préventive spécifique que porte Kaihi.**

---

## 7. Kessai — "routes a swap to a venue and issues a settlement receipt for the execution." (rôle act, **upcoming**)

### 7.1 Le problème réel aujourd'hui

- **Échéance réglementaire en plein milieu de la fenêtre — MiCA Article 78** : l'obligation de
  "meilleure exécution" pour les prestataires de services sur crypto-actifs (CASP) devient
  pleinement contraignante le **1er juillet 2026** (fin de la période transitoire MiCA,
  **dans la fenêtre**). Verbatim (paraphrase de l'article, citant le texte réglementaire) :
  « the obligation of best execution and the consideration by the crypto-asset service
  provider of factors such as price, cost, speed of execution, purpose of execution and
  settlement, and conditions of securing or holding crypto-assets. » L'article 76 impose une
  conservation des enregistrements d'au moins 5 ans. Sanctions : « €5,000,000 or 3% of total
  annual turnover, whichever is higher. » Cadrage supplémentaire (Kaiko, source à vocation
  commerciale, à pondérer) : « the ability to objectively measure execution quality in a
  reproducible and auditable way becomes a key criterion for viability. » Source :
  [kaiko.com, deadline 2026-07-01](https://www.kaiko.com/resources/how-crypto-regulation-will-reshape-brokerage-in-2026-2)
  [lu].
- **Exploits de la couche agrégateur, hors fenêtre mais structurants** : SwapNet (agrégateur
  intégré à Matcha Meta), 25 janvier 2026 **[hors fenêtre]**, 13,43 M$ — une vulnérabilité
  "arbitrary-call" a permis de router des appels vers n'importe quelle adresse, drainant les
  portefeuilles ayant accordé des approbations illimitées (dont ~10,5 M$ d'USDC convertis en
  ~3 655 ETH puis pontés). Jupiter Aggregator (Solana), février 2025 **[hors fenêtre]**, 7,3 M$.
  Ce ne sont pas des échecs de "meilleure exécution" au sens strict mais des failles de
  sécurité de la couche d'approbation — mentionnés pour distinguer clairement les deux
  problèmes (sécurité de l'agrégateur vs qualité/preuve d'exécution). Source : WebSearch
  **[abs]**, non ouvertes en détail.
- **NON TROUVÉ** : un épisode nommé, chiffré et daté DANS la fenêtre d'une exécution
  sous-optimale (slippage anormal, non-best-price) sur un agrégateur DEX précis — au-delà des
  statistiques agrégées de flux toxique déjà citées en §6 (sandwich bots, ~60 M$/an).

### 7.2 Qui s'en occupe déjà

- **Agrégateurs DEX eux-mêmes** : 1inch revendique plus de 700 Md$ de volume de swap cumulé sur
  12 chaînes et ~180 M$/jour de flux stablecoin rien que sur Arbitrum (le plus gros agrégateur
  sur cette métrique) ; 522+ sources de liquidité, protection MEV structurelle via "Fusion",
  frais de routage à 0 % en général. CowSwap : enchères par lots, « trades are matched
  peer-to-peer where possible and never appear individually in the public mempool ». Odos :
  routage multi-entrées/multi-sorties pour minimiser l'impact de prix sur les gros ordres. 0x :
  0,15 % sur certaines paires. Velora/ParaSwap Delta : 0,15 % du surplus. KyberSwap :
  0,04-0,1 %. Source : WebSearch **[abs]** (eco.com, ccn.com, foxwallet.com), non ouvertes en
  détail.
- **Vendeurs d'analytics "meilleure exécution"/TCA institutionnels, positionnés crypto** —
  c'est l'incumbent le plus direct trouvé cette passe : **Kaiko** vend un produit nommé "Kaiko
  Best Execution" explicitement positionné pour la conformité MiCA Art. 78 — données tick L2 sur
  100+ bourses, reconstruction d'order book en temps réel, pistes d'audit avec données brutes
  (horodatage, prix, volume, sens). **CoinRoutes** : lauréat 2026 Hedgeweek Global Digital
  Assets Awards (Algorithmic Trading Solution Provider + Risk Management Software), TCA
  capturant slippage/impact marché/timing. **Talos** : TCA institutionnelle pour actifs
  numériques. **ION LookOut TCA** : lauréat "Best Transaction Cost Analysis Solution for Best
  Execution" aux RegTech Insight Awards Europe 2026 (origine probablement TradFi/MiFID II,
  extension crypto non confirmée en détail). Marché TCA global : **2,8 Md$ en 2025** (majorité
  TradFi, poussé par MiFID II). Source : WebSearch **[abs]** (kaiko.com [lu pour la partie
  MiCA], prnewswire.com, a-teaminsight.com, coinroutes.com), non toutes ouvertes en détail.
- **Primitive adjacente en construction, hors du périmètre swap** : le standard de paiement
  agentique **x402** (écosystème lié à Coinbase) a une pull request ouverte proposant une
  « Settlement-Receipt Binding extension », liant les enregistrements de règlement aux reçus
  pour vérifier ce qui s'est effectivement réglé on-chain — pertinent conceptuellement (cf.
  §12a) mais pour les paiements agent-à-agent, pas pour le routage de swaps. Source :
  [github.com/x402-foundation/x402 PR #2666](https://github.com/x402-foundation/x402/pull/2666)
  **[abs]**, non ouverte en détail.

### 7.3 Où est le trou

**Constat important qui nuance la thèse de départ** : la fonction générale "prouver la
meilleure exécution" n'est PAS un vide — c'est un marché établi et commercialisé, avec des
acteurs primés en 2026 et un produit (Kaiko) explicitement vendu pour la conformité MiCA Art.
78. Le trou, s'il existe, est plus étroit que la formulation large de Kessai : tous les
vendeurs identifiés (Kaiko, CoinRoutes, Talos, ION LookOut) sont des **observateurs tiers
centralisés** qui reconstruisent la qualité d'exécution *après coup* à partir de données de
marché qu'ils collectent eux-mêmes (ex. Kaiko agrège des données tick sur 100+ bourses) — aucun
n'a été trouvé délivrant un **reçu de règlement attesté nativement on-chain, au moment même du
swap, par la venue ou l'agrégateur qui exécute**, vérifiable sans faire confiance au pipeline de
données propriétaire du vendeur d'analytics. La "Settlement-Receipt Binding extension" de x402
montre que la primitive technique (lier un règlement à un reçu vérifiable) est en cours de
normalisation ailleurs (paiements agentiques) mais n'a pas été trouvée appliquée au routage de
swaps. **Verdict : trou étroit et spécifique (reçu natif on-chain, émis à l'exécution, par
opposition à l'analytics post-hoc tierce) au sein d'un marché large déjà encombré** — à traiter
avec prudence : Kaiko/CoinRoutes/Talos pourraient déjà couvrir une partie de ce terrain sans que
la lecture (pages de présentation seulement) l'ait révélé.

### 7.4 Données disponibles

Les données de trade des agrégateurs DEX sont publiques via APIs/subgraphs (1inch, CowSwap,
Odos exposent des APIs documentées). MiCA elle-même impose une conservation de 5 ans des
enregistrements (Art. 76), ce qui structure une base de données réglementaire croissante chez
les CASP européens. **Épisode/jalon held-out proposé** : l'échéance **MiCA Art. 78 du
2026-07-01** elle-même (dans la fenêtre) — comparer la qualité/preuve d'exécution documentée
avant/après cette date serait un test naturel de calibration, bien qu'aucun épisode individuel
chiffré n'ait été trouvé cette passe pour l'ancrer.

### 7.5 Signal de demande

**Fortement démontré au niveau de la fonction large** : marché TCA institutionnel de 2,8 Md$
(2025), plusieurs vendeurs crypto-spécifiques primés en 2026 (CoinRoutes, ION LookOut), Kaiko
vendant un produit nommément dédié à la conformité MiCA Art. 78 — avec une **obligation
réglementaire chiffrée et datée** (5 M€ ou 3 % du CA, dès le 2026-07-01) qui crée une demande
de paiement quasi certaine chez les CASP européens. **NON TROUVÉ** spécifiquement pour la forme
"reçu de règlement on-chain natif, attesté à l'exécution" par opposition à l'analytics post-hoc
centralisée — aucun signal de demande distinct trouvé pour ce sous-segment précis. Verdict
global : **demande démontrée et pressante pour la fonction large (obligation réglementaire
MiCA chiffrée) ; le sous-segment on-chain-natif que viserait Kessai reste non démontré
distinctement, dans un marché déjà partiellement encombré.**

---

## 8. Kamae — "quotes both sides of a market from inventory, and stays silent when told to abstain." (rôle act, **upcoming**)

### 8.1 Le problème réel aujourd'hui

- **HLP (vault de market making natif de Hyperliquid) — cible répétée et prévisible** : le
  vault a été attaqué à trois reprises documentées — JELLYJELLY (mars 2025), POPCAT (novembre
  2025), Fartcoin (**9 avril 2026**, tous **[hors fenêtre]**) — 1,5 M$ perdus lors de
  l'incident Fartcoin : un attaquant a construit une position longue de 15 M$ sur 4
  portefeuilles puis s'est délibérément fait liquider en période de faible liquidité (position
  probablement couverte en externe pour capter le profit ailleurs pendant que HLP absorbait la
  perte). Verbatim (synthèse WebSearch **[abs]**) : « HLP's role as backstop liquidator makes
  it a predictable and repeatable target for coordinated attacks. » Hyperliquid a nié tout hack
  du protocole dans chaque cas.
- **Déclin de TVL HLP, à la frontière de la fenêtre** : ~269 M$ en juin 2026 → ~184 M$
  (« as of August 2026 », dont -25 % sur les 30 jours précédents) — dates imprécises dans la
  source, chevauchement partiel avec la fenêtre 90 jours. Source : WebSearch **[abs]**
  (hyperacademy.io et sources associées), non ouvertes en détail.
- **Illustration la plus nette de l'abstention comme pratique professionnelle réelle — [hors
  fenêtre, 11 octobre 2025, mais la source la plus directement pertinente trouvée cette
  passe]** : lors du crash à 19 Md$ de liquidations (déclenché par des menaces tarifaires de
  Trump contre la Chine), deux teneurs de marché ont arrêté de coter. Verbatim LO:TECH :
  « Our systems worked as intended: The risk engine's circuit breakers kicked in and pulled our
  quotes. » Verbatim Wintermute : « if we're shorting a perp for any type of hedging reasons,
  and then we also get liquidated on these very volatile spikes, then it becomes difficult » —
  menant à devoir « review your entire market making strategy. » Les deux firmes ont présenté
  leur pause comme une réponse de sécurité automatique, pas un choix discrétionnaire de
  profit. Source : [finance.yahoo.com, 2025-10-17](https://finance.yahoo.com/news/why-wintermute-other-market-makers-180022935.html)
  [lu].
- **NON TROUVÉ** : un incident de market making chiffré et daté strictement DANS la fenêtre
  (2026-06-20 → 2026-09-18) — limite de sourcing explicite de cette passe.

### 8.2 Qui s'en occupe déjà

- **Six teneurs de marché institutionnels dominants** (source WebSearch **[abs]**, non ouverte
  en détail) : Wintermute, GSR, Keyrock, DWF Labs, Auros, Flowdesk.
- **Flowdesk** : modèle retainer via son produit "Market-Making-as-a-Service" (MMaaS),
  couverture de 140+ venues CEX+DEX.
- **Keyrock** : 85+ bourses, 1 400+ marchés individuels ; se positionne sur un reporting basé
  KPI avec tableaux de bord client en temps réel — l'incumbent le plus proche d'une couche de
  "visibilité/reporting" externe, mais rien de trouvé sur une capacité d'abstention formalisée
  et exposée.
- **DWF Labs** : ~60+ bourses couvertes.
- **GSR** : mandat public chiffré avec Stake DAO — **100 000 $ de frais de mise en place +
  20 000 $/mois de retainer + prêt de 1 M$ en BTC/ETH**. Exemple concret d'un DAO payant pour
  du market making. Deux modèles commerciaux dominants dans l'industrie : retainer mensuel
  (le projet garde la custody de ses tokens) vs prêt-et-options d'achat (le projet prête ses
  tokens contre des calls) — « many teams prefer the retainer model for cleaner incentive
  alignment » (WebSearch **[abs]**). Source : [flowdesk.co](https://www.flowdesk.co/insights/crypto-market-making-retainer-vs-loan-call-model)
  et synthèse WebSearch, **[abs]**, non ouvertes en détail.
- **HLP (Hyperliquid)** : vault de market making/liquidation natif au protocole, capital mis en
  commun par des déposants (y compris retail), distinct des mandats bespoke des six firmes
  ci-dessus — mais, d'après le motif répété d'attaques ci-dessus, semble dépourvu d'un
  mécanisme d'abstention efficace face à des schémas d'attaque désormais identifiés et
  répétés.

### 8.3 Où est le trou

Les tableaux de bord KPI de Keyrock sont l'élément le plus proche d'une couche de reporting
externe, mais aucun incumbent trouvé cette passe ne publie un mécanisme formel de **"silence
sur commande"** — un état "j'abstiens" distinct et vérifiable de l'extérieur (par un DAO, un
protocole, ou une contrepartie), séparé du simple "commit/quote". Le cas Wintermute/LO:TECH
(octobre 2025) montre que l'abstention existe bel et bien comme pratique professionnelle réelle
— mais **en interne, via des coupe-circuits propriétaires**, pas comme une capacité produit
externement observable/gouvernable. Le cas HLP est l'illustration inverse et la plus publique :
un vault de market making **sans** mécanisme d'abstention efficace, attaqué de façon répétée et
prévisible par le même schéma (position construite puis auto-liquidée en faible liquidité) sur
trois épisodes documentés en environ 13 mois. **Verdict : trou plausible et illustré par un cas
public répété (HLP)** — la fonctionnalité "abstention vérifiable de l'extérieur, exposée comme
un état de gouvernance" n'a été trouvée nulle part comme produit ; ce qui existe (Wintermute/
LO:TECH) est interne et propriétaire, pas un produit tiers.

### 8.4 Données disponibles

La TVL et les performances de HLP sont publiquement dashboardées (les chiffres 269 M$ → 184 M$
proviennent d'un suivi public). Les données de cotation/remplissage on-chain d'Hyperliquid sont
publiques ; les données de market making côté CEX (Wintermute, GSR, etc.) restent
propriétaires et non accessibles. **Épisode held-out nommé proposé** : l'attaque **Fartcoin sur
HLP du 2026-04-09** [hors fenêtre mais bien documentée, schéma répétable] ou, comme cas de
référence pour l'abstention elle-même, le **11 octobre 2025** (pause Wintermute/LO:TECH). **NON
TROUVÉ** : un épisode propre, chiffré, strictement DANS la fenêtre.

### 8.5 Signal de demande

**Démontré pour le mandat de market making générique payé** : GSR/Stake DAO (100 000 $ de
mise en place + 20 000 $/mois + prêt de 1 M$) est un exemple public et chiffré de DAO payant
pour cette fonction. **NON TROUVÉ** spécifiquement pour une fonctionnalité d'abstention
externe/vérifiable vendue ou demandée en tant que telle — Keyrock vend du reporting/KPI mais
rien de trouvé sur une "abstention as a service" nommée ; aucun mandat ou RFP trouvé demandant
explicitement cette capacité. Verdict global : **demande démontrée pour le market making
générique payé (mandat GSR/Stake DAO chiffré) ; non démontrée pour la fonctionnalité
d'abstention externe spécifique que porte Kamae.**

---

## 9. Kyokusen — "fits a yield curve across maturities and gates rollovers and looped positions against it." (rôle act, **upcoming**, cible Pendle)

### 9.1 Le problème réel aujourd'hui

- **Cascade de liquidation PT-reUSD sur Morpho, 25 août 2026, ~08:00 UTC (exécution 04:38 UTC)
  — pile DANS la fenêtre, cas le plus précisément documenté de toute cette étude** : un
  portefeuille (0x854e…690d) a acheté des yield tokens (YT-reUSD) en volumes concentrés,
  poussant le rendement implicite à ~20 % ; comme YT et principal token (PT) évoluent en sens
  inverse, cela a artificiellement déprimé la valeur du PT. Verbatim : « By buying YTs, 0x854e
  pushed 5.4M PT into a pool holding 3.1M PTs. The 15-min TWAP price falls to 0.9647. » Un
  emprunteur (0xaa34…) à 90,9 % de LTV en collatéral PT a été liquidé quand l'oracle TWAP
  15 minutes a enregistré ce prix artificiellement bas. **33 événements de liquidation entre
  04:37 et 04:51 UTC (14 minutes)**. Chiffres : 36,39 M$ de liquidations totales, 11,7 M de
  PT-reUSD saisis, profit estimé de l'attaquant ~360 000 $ — **un déclencheur minuscule (360 k$)
  pour une cascade 100x plus grosse (36,4 M$)**. Aucune mauvaise dette créée ; reUSD lui-même
  resté stable (déclarations Pendle/Steakhouse, [abs]). Verbatim (Re protocol, émetteur reUSD) :
  « We are investigating whether the PT market price was intentionally manipulated and are
  working with relevant teams on a safer oracle configuration. » Source :
  [cryptotimes.io, 2026-08-25](https://www.cryptotimes.io/2026/08/25/morphos-15-minute-twap-oracle-exploited-in-36-4m-liquidation-attack/)
  [lu]. **Contradiction consignée (doc 03 §7)** : une autre source (WebSearch **[abs]**,
  cryptobriefing.com) cite 38,6 M de PT saisis et 36,14 M$ de dette remboursée — écarts non
  arbitrés avec les chiffres cryptotimes ci-dessus.
- **Réponse de l'écosystème, toujours au stade de proposition** : LlamaRisk a soumis à la
  gouvernance Aave un système nommé **"LlamaGuard PT"** — mécanisme central : « Rather than
  referencing pool prices directly, the design employs a multi-day smoothed rate that re-prices
  only when drift exceeds a published 0.30% gate », avec « each step bounded by contract-
  enforced limits and subject to minimum delays between updates », rendant une manipulation
  « slow, expensive, and visible » (l'attaquant devrait maintenir le déplacement de prix
  pendant des jours, pas des minutes). Le système inclut des **seuils de liquidation
  dynamiques qui augmentent à mesure que les PT approchent de leur maturité** (« automatically
  expanding borrowing power as the asset de-risks ») — infrastructure prévue sur le Chainlink
  Runtime Environment. **Statut : proposition seulement, aucune preuve d'implémentation trouvée
  dans la source.** Source :
  [mpost.io](https://mpost.io/llamaguard-proposes-bounded-oracle-redesign-as-36m-morpho-liquidation-episode-renews-defi-risk-architecture-debate/)
  [lu].
- **Ajustements continus et manuels, dans la fenêtre** : le forum de gouvernance Aave montre
  une série de posts "Risk Stewards: PT parameter changes" tout au long de 2026 (2026-05-14,
  05-28, 06-12, 08-15) — LlamaRisk y recommande des changements de paramètres E-Mode « based on
  re-evaluation of PT parameter methodology as discount rates have continued to compress toward
  maturity » (WebSearch **[abs]**, non ouvert en détail). Même motif que celui déjà observé en
  §2 pour le risk-stewarding général : ajustement manuel, point par point, sans garantie
  formalisée.
- **Échelle du marché (chiffres volatils, à pondérer)** : Pendle aurait vu sa TVL passer d'un
  pic de 13,1 Md$ à ~1,499 Md$ en mai 2026 (WebSearch **[abs]**, écart de ~88 % non recoupé
  indépendamment — à traiter avec prudence, possible erreur de méthodologie/temporalité dans la
  source). Boros (produit dérivé de taux de financement perpétuel de Pendle) : volume mensuel
  2,9 Md$ (janvier 2026), volume cumulé 9,8 Md$, intérêt ouvert ~6,9 Md$ [abs]. Flux de RWA
  tokenisés à travers Pendle > 23,6 Md$ (mars 2026) [abs].

### 9.2 Qui s'en occupe déjà

- **Pendle (protocole lui-même)** : affiche nativement une **courbe de rendement par marché**
  (rendement implicite à travers les maturités) — la primitive "yield curve" existe déjà,
  publique et gratuite, mais c'est un affichage, pas un mécanisme de gate sur les positions
  d'autres protocoles (Aave, Morpho) qui acceptent des PT en collatéral.
  Source : [defillama.com/protocol/pendle](https://defillama.com/protocol/pendle) et synthèse
  WebSearch **[abs]**.
  Verbatim descriptif : « The PT trades at a discount to the underlying asset, and that
  discount IS the fixed yield. »
- **LlamaRisk** : incumbent le plus proche trouvé — déjà rémunéré comme risk steward d'Aave
  (cf. §2), il gère activement les paramètres PT (ajustements réguliers, ci-dessus) ET a
  proposé "LlamaGuard PT", un mécanisme structurellement proche de ce que Kyokusen décrit
  (courbe/maturité + gate). Mais : (a) spécifique à Aave, (b) au stade proposition seulement au
  moment de la source, (c) réactif à cet incident précis plutôt qu'un produit générique
  préexistant.
- **Chainlink** : fournisseur d'infrastructure pressenti pour héberger le système
  LlamaGuard PT ("Chainlink Runtime Environment") — couche technique, pas le produit de
  risque lui-même.
- **Re protocol (émetteur reUSD) et Steakhouse** : impliqués dans la réponse post-incident,
  rôles exacts non détaillés cette passe.
- **Différence structurelle Morpho vs Aave, pertinente pour le trou (§9.3)** : Morpho est
  « a set of isolated, immutable, permissionless markets fixed at creation » — contrairement à
  Aave (pool partagé unique où la gouvernance vote et peut modifier les paramètres de tout
  actif), un marché Morpho donné n'a pas de gouvernance de paramètres vivante après sa
  création. C'est précisément un marché Morpho (PT-reUSD) qui a été touché. Source :
  [otomato.xyz, synthèse WebSearch](https://otomato.xyz/blog/morpho-vs-aave) **[abs]**.

### 9.3 Où est le trou

Le fait que LlamaRisk converge indépendamment vers une architecture proche de Kyokusen
("LlamaGuard PT" : courbe lissée + seuils dynamiques indexés sur la maturité) **valide
fortement la thèse du problème** — mais signale aussi qu'une partie du trou est en cours de
comblement, au moins pour Aave, par l'incumbent déjà en place. Ce qui reste net comme trou :
(1) **LlamaGuard PT n'était, à la date de la source, qu'une proposition non implémentée** ; (2)
c'est un correctif **spécifique à Aave**, pas un service cross-protocole ; (3) surtout,
l'incident du 25 août a frappé un marché **Morpho**, dont l'architecture (marchés isolés,
immuables, fixés à la création) **ne permet structurellement pas** le type de correctif de
gouvernance centralisée que LlamaGuard propose pour Aave — un marché Morpho ne peut pas être
"patché" après coup de la même façon. **Verdict : trou réel et partiellement validé par la
convergence de l'incumbent lui-même vers une solution proche, mais ce trou se referme
activement côté Aave ; il reste le plus net et le moins couvert spécifiquement sur les venues à
marchés isolés de type Morpho**, où aucun mécanisme de gate centralisé équivalent n'a été
trouvé cette passe.

### 9.4 Données disponibles

Pendle publie nativement des courbes de rendement par marché (gratuit, public). Les données de
liquidation Morpho sont publiques et suffisamment granulaires pour reconstruire l'incident à la
minute et à l'adresse de portefeuille près (comme l'ont fait cryptotimes.io et mpost.io).
**Épisode held-out nommé proposé, excellent candidat** : la **cascade PT-reUSD du 2026-08-25**
(04:37-04:51 UTC) — richement documentée (adresses, valeurs TWAP exactes, chronologie à la
minute), directement dans la fenêtre, avec une petite divergence de chiffres entre sources à
noter (§9.1) mais sans ambiguïté sur le mécanisme.

### 9.5 Signal de demande

**Démontré mais agrégé à un mandat plus large** : LlamaRisk est déjà rémunéré comme risk
steward général d'Aave (cf. §2, 1,6 M$/an pour Gauntlet historiquement, 5 M$/an proposés à
Chaos Labs) — son travail sur les paramètres PT et la proposition LlamaGuard s'inscrivent dans
ce mandat existant, pas comme ligne budgétaire séparée identifiée pour une fonction "courbe de
rendement + gate" à part entière. **NON TROUVÉ** : un signal de demande équivalent côté Morpho
(là où l'incident a eu lieu) — aucun mandat ou RFP Morpho-side trouvé pour ce type de service
cette passe, alors même que c'est la venue structurellement la plus exposée (§9.3). Verdict
global : **demande démontrée pour la fonction générale de risk-stewarding (mandat Aave/
LlamaRisk existant, dans lequel le travail PT est englouti) ; non démontrée comme produit
autonome, et notamment absente côté Morpho où le trou est le plus net.**

---

## 10. Koyomi — "flattens leveraged exposure ahead of a recurring weekend trading-window closure." (rôle act, **upcoming**, cible HIP-3 / hours gap)

### 10.1 Le problème réel aujourd'hui

- **HIP-3 (Hyperliquid Improvement Proposal 3)** : lancé en octobre 2025, permet à des équipes
  tierces de déployer leurs propres marchés perpétuels en stakant 500 000 HYPE (~25 M$, un bond
  de sécurité récupérable mais **slashable en cas de mauvaise gestion d'oracle**, avec 30 jours
  de blocage post-halt + 7 jours de file de unstaking). Étendu aux actions, indices, matières
  premières, forex, pre-IPO. Échelle au **25 août 2026 (dans la fenêtre)** : 144 marchés HIP-3
  actifs sur 10 venues de builders, ~3,27 Md$ de volume 24h, ~3,78 Md$ d'intérêt ouvert. Les
  marchés opérés par des builders seraient passés de ~2 % du volume total Hyperliquid début
  2026 à **~50 % aujourd'hui** [abs]. **trade.xyz domine >90 % de l'OI HIP-3** — concentration
  notable. Source : WebSearch **[abs]** (nansen.ai, crowdfundinsider.com, bitget.com), non
  ouvertes en détail.
- **Mécanisme précis du problème (guide de sécurité dédié aux builders HIP-3, [lu])** : hors
  heures de marché, HIP-3 utilise un prix "clampé" — « price adjustments are made based on the
  stock's previous closing price, taking into account internal buying and selling pressure » —
  le prix marked étant restreint à 1/max_leverage de la variation de clôture précédente (ex.
  10 % pour un actif à levier 10x). **Le dilemme à la réouverture** : soit maintenir le clamp
  (écart sévère entre prix interne et prix externe), soit répercuter rapidement le prix externe
  restauré, ce qui « can trigger concentrated liquidation pressure in a short period of time. »
  Source : [panews.io](https://panews.io/articles/f2182904-7e33-4e85-994e-2519dea54f13) [lu].
- **Incident nommé n°1, 14 décembre 2025 [hors fenêtre mais fondateur]** : sur XYZ100 (suit les
  futures Nasdaq NQ) de trade.xyz, un portefeuille nouvellement financé a shorté 10 M$ un
  dimanche après-midi — alors que le NQ ne trade pas ce jour-là — provoquant une baisse de
  3,5 % et liquidant 13 M$ de positions longues. Des concurrents ont critiqué publiquement ce
  design ; citation rapportée : « weekend closure on perps that don't have a 24/7 spot market
  is a feature, not a bug » (en référence à la structure alternative d'Ostium — cf. §1, déjà
  victime d'un exploit d'oracle de 18 M$ le 2026-07-15). Source :
  [thedefiant.io](https://thedefiant.io/news/defi/tradexyz-faces-backlash-after-whale-triggers-weekend-liquidations)
  **[abs]**, non ouvert en détail.
- **Incident nommé n°2, 27 juillet 2026 — DANS LA FENÊTRE** : le perpétuel SK Hynix sur
  trade.xyz s'est effondré après qu'une action SK Hynix a coté 29,96 % sous son cours de
  clôture précédent sur le pré-marché NextTrade (Corée du Sud) — prix « relayed faithfully » par
  l'oracle de trade.xyz. Résultat : **~57 M$ de liquidations, ~17,3 M$ de pertes réalisées**.
  Sous HIP-3, la responsabilité de la conception de l'oracle et de la source de prix incombe au
  déployeur (trade.xyz), pas à l'infrastructure Hyperliquid sous-jacente. Trade.xyz a annoncé
  qu'il couvrirait les pertes de liquidation. Source : WebSearch **[abs]** (finance.yahoo.com,
  cryptopotato.com, thecurrencyanalytics.com), non ouvertes en détail mais cohérentes entre
  plusieurs titres.
- **Le problème s'étend activement à d'autres venues, la semaine même de cette recherche** :
  le 18 septembre 2026 (aujourd'hui), Bybit a lancé des "24/7 perp options" sur les actions
  SpaceX et Nvidia, et Coinbase a déposé une demande pour des futures perpétuels sur actions
  individuelles aux États-Unis — le problème "écart d'heures" ne restera pas propre à
  Hyperliquid/HIP-3. Sources : [cryptotimes.io](https://www.cryptotimes.io/2026/09/18/bybit-launches-24-7-perp-options-on-spacex-and-nvidia-stock-perpetuals/)
  et [cryptotimes.io](https://www.cryptotimes.io/2026/09/18/coinbase-files-to-expand-u-s-derivatives-into-single-stock-perpetuals/)
  **[abs]**, non ouvertes en détail.

### 10.2 Qui s'en occupe déjà

- **Aucun outil tiers dédié de "flatten avant fermeture" n'a été identifié cette passe.**
- **trade.xyz (builder dominant)** : gère le problème en interne (conception d'oracle propre,
  prix clampé) et a réagi à l'incident SK Hynix par un **geste discrétionnaire et réactif** —
  rembourser les pertes — plutôt que par un mécanisme préventif documenté.
- **Mitigations proposées (pas confirmées comme implémentées) dans le guide de sécurité
  PANews** : ancrer les prix de référence pendant la fermeture sur des sources externes —
  **Blue Ocean ATS** (venue de trading après-heures pour actions US) et **IG Weekend CFD
  Quotes** (flux de cotation CFD week-end d'un courtier) — décrites comme fournissant des
  « price signals during market closures » sans remplacer directement le prix spot. **Aucun
  outil de dé-levier automatique côté builder n'est mentionné dans la source.**
- **Ostium** : design alternatif — fermeture du marché lui-même plutôt que gestion active de
  l'écart (approche structurellement différente, pas une "flatten avant fermeture").
- **Mécanisme de slashing HIP-3** : pénalise après coup la « mauvaise gestion d'oracle » sur le
  stake de 500 000 HYPE du builder — un déterrent économique, pas un mécanisme préventif de
  réduction d'exposition.

### 10.3 Où est le trou

Le guide de sécurité dédié aux builders HIP-3 (source spécialisée, [lu]) propose des ancrages de
prix externes mais **ne mentionne aucun outil existant de dé-levier automatique avant fermeture
de fenêtre** — confirmation explicite, par une source dont c'est precisément l'objet, que ce
mécanisme n'existe pas encore comme produit. Les deux incidents nommés (déc. 2025 : 13 M$ ;
juillet 2026 : 57 M$/17,3 M$), séparés de moins de 8 mois et touchant le **même builder
dominant** (trade.xyz, >90 % de l'OI HIP-3), montrent que le problème n'est pas résolu même chez
l'acteur le mieux doté du secteur. Le sujet est de plus en pleine expansion (Bybit, Coinbase
entrant sur les perpétuels actions la semaine même de cette recherche), ce qui va multiplier le
nombre de venues confrontées au même problème sans solution partagée. **Verdict : trou réel et
net**, avec confirmation explicite d'absence d'outil dans une source de sécurité dédiée, deux
incidents chiffrés et datés en moins de 8 mois chez le builder dominant, et un périmètre du
problème en expansion active au moment même de cette étude.

### 10.4 Données disponibles

Les données de marché HIP-3 (144 marchés, volumes, OI) sont publiquement dashboardées
(instantané du 2026-08-25 cité ci-dessus). **Épisode held-out nommé proposé, dans la fenêtre** :
**SK Hynix / trade.xyz, 27 juillet 2026** — cause précise et publique (mouvement de -29,96 % sur
une seule action en pré-marché NextTrade, relayé fidèlement par l'oracle), chiffres cohérents
entre plusieurs titres (57 M$ liquidations / 17,3 M$ pertes réalisées). Complément hors fenêtre
pour comparaison : XYZ100/trade.xyz du 2025-12-14 (10 M$ de short déclencheur → 13 M$ liquidés),
mécanisme plus simple à isoler (un seul acteur, un seul instrument).

### 10.5 Signal de demande

**NON TROUVÉ** : aucun mandat, RFP ou budget identifié pour un service de "flatten avant
fermeture de fenêtre." La réponse de trade.xyz à l'incident SK Hynix — rembourser
discrétionnairement plutôt que documenter un mécanisme préventif acheté/construit — est un
**signal de demande faible** en l'état (choix de la réparation a posteriori plutôt que de la
prévention, au moins visiblement). **Pression économique réelle et chiffrée existant
malgré tout** : chaque builder immobilise 500 000 HYPE (~25 M$) slashables en cas de mauvaise
gestion d'oracle — un risque financier direct et quantifié qui rend une demande future
plausible, sans qu'elle soit confirmée par un paiement observé cette passe. Verdict global :
**problème vivant et net (deux incidents chiffrés en 8 mois, dont un dans la fenêtre à 57 M$) ;
trou confirmé explicitement par une source de sécurité dédiée ; demande non démontrée par un
mandat payé observé, mais appuyée par une mise financière réelle et slashable (~25 M$/builder).**

---

## 11. Genkan — "the point every transfer, swap, or signature passes through first, returning a commit, defer, or abstain decision along with the remaining budget." (rôle distribution, **upcoming**)

### 11.1 Le problème réel aujourd'hui

- **Phishing/drainers d'approbation, tendance de fond [surtout hors fenêtre mais utile comme
  échelle]** : pertes via wallet drainers 494 M$ (2024) → ~83,85 M$ (2025), soit -83 % (Scam
  Sniffer, **[abs]**). Rebond en 2026 vers le "whale hunting" : en janvier 2026, les pertes de
  phishing par signature auraient bondi de +207 % en un mois à 6,27 M$ alors que le nombre de
  victimes distinctes baissait de 11 % à 4 741 — deux victimes représentant 65 % des pertes du
  mois **[hors fenêtre, abs]**. Nouvelle surface d'attaque : les signatures groupées **EIP-7702**
  (post-upgrade Pectra) permettent de regrouper plusieurs opérations dans une seule approbation
  — 2 cas documentés en 2025 totalisant 2,54 M$ **[hors fenêtre, abs]**.
- **Incident central pour Genkan — Bankr/Grok, mai 2026 [hors fenêtre de ~6 semaines, mais
  analysé dans un rapport publié DANS la fenêtre, cf. ci-dessous]** : un attaquant a encodé une
  instruction financière en morse à destination du chatbot Grok (xAI), qui l'a décodée et
  publiée publiquement. **Bankr**, un assistant de trading IA, a lu ce message public comme une
  autorisation de paiement authentifiée et exécuté un **transfert autonome de 175 000 $ en
  tokens DRB**. Nommé par les analystes : « AI agent permission chain abuse » — la sortie d'un
  système IA devient une autorisation financière de confiance pour un autre système IA. C'est
  une illustration quasi parfaite de l'absence exacte de gate que Genkan formalise (commit /
  defer / abstain avant exécution). Source : [techtimes.com, 2026-07-29](https://www.techtimes.com/articles/321940/20260729/crypto-hacks-hit-all-time-high-north-korea-drains-over-600m-ai-agents-become-new-target.htm)
  [lu].
- **Rapport H1 2026 de Blockaid (l'incumbent dominant lui-même), publié le 2026-07-29 — DANS LA
  FENÊTRE** : contexte plus large — pertes crypto totales H1 2026 dominées à 55 % par des
  attaques liées à la Corée du Nord (~609 M$), concentrées sur une fenêtre de 17 jours en avril
  2026 (Drift Protocol 285 M$ le 1er avril + Kelp DAO 292 M$ le 18 avril = 577 M$ combinés —
  chiffres coherents avec ceux déjà cités en §1 et §2). Sur les agents IA spécifiquement, le
  rapport « projected that AI agent deployments are growing approximately tenfold per year »
  et anticipe « multiple AI agent incidents in H2 2026, with prompt injection attacks as the
  leading vector, followed by tool-use abuse and unauthorized signing » — **l'incumbent le plus
  établi du secteur anticipe lui-même, dans la fenêtre, une vague d'incidents sur exactement le
  terrain de Genkan pour le second semestre 2026.** Source : même article techtimes.com [lu].
- **Autre incident cité (source, date précise NON TROUVÉE)** : « 26 routers secretly injecting
  malicious tool calls, stealing credentials and draining a client's crypto wallet of
  $500,000 » — compromission de routeurs LLM, **[abs]**, non recoupé en détail. Perte agrégée
  citée pour les faiblesses d'infrastructure d'agents IA en 2026 : « over $45 million in
  losses » **[abs]**, méthodologie non détaillée.
- **NON TROUVÉ** : un incident agent-IA-vs-wallet nommé, chiffré et daté strictement APRÈS le
  2026-06-20 — limite de sourcing explicite ; le meilleur candidat (Bankr/Grok) précède de peu
  le début de la fenêtre, seul son analyse/rapport est daté dans la fenêtre.

### 11.2 Qui s'en occupe déjà

- **Blockaid** : se décrit comme « the security infrastructure behind Coinbase, MetaMask,
  Uniswap, Safe, and dozens of the most widely used platforms. » Financement cumulé 89,1 M$
  (6 M$ seed fin 2022 + 27 M$ série A oct. 2023 + 50 M$ série B fév. 2025 menée par Ribbit
  Capital, tous **[hors fenêtre]**), valorisation 315,4 M$ "as of 2026" **[abs]**. Partenariat
  MetaMask : alertes de sécurité natives via un « Privacy Preserving Offline Module (PPOM) »
  bloquant les transactions malveillantes/frauduleuses avant exécution. Intégration Coinbase
  Wallet : en 5 mois, aurait permis d'éviter le vol de **75 M$+** et bloqué **~800 000
  connexions** à des dApps malveillantes — signal d'impact concret et chiffré. Sources :
  [coingape.com](https://coingape.com/just-in-metamask-and-blockaid-team-up-to-boost-wallet-security/),
  [calcalistech.com](https://www.calcalistech.com/ctechnews/article/r1khgigr6) **[abs]**, non
  ouvertes en détail.
- **Harpie** : se décrit comme « the first on-chain firewall that prevents hacks, scams, and
  theft » — surveille les transactions en attente et déplace les fonds hors d'un wallet
  vulnérable avant le vol ; disponible comme dapp intégrée à Coinbase Wallet. **[abs]**, non
  ouvert en détail.
- **Autres acteurs du secteur (Forta, Webacy, Pocket Universe, Revoke.cash, Kerberus, etc.)** :
  NON EXPLORÉS cette passe — connus du domaine mais aucune source ouverte pour eux dans cette
  session ; ne pas les citer avec des détails non vérifiés serait contraire à la discipline
  doc 03. Limite explicite.

### 11.3 Où est le trou

Les incumbents identifiés (Blockaid, Harpie) sont des **pare-feu pré-transaction pour wallets
orientés humains**, conçus pour détecter des contrats/adresses malveillants connus et des
patterns de phishing — un marché mature, massivement déployé (Coinbase, MetaMask, Uniswap,
Safe) et à impact chiffré (75 M$+ économisés en 5 mois chez Coinbase). Mais l'incident Bankr/
Grok montre un **mode de défaillance différent** : ce n'est pas un contrat malveillant connu
qui a trompé le système, c'est **un agent IA qui a fait confiance à la sortie non vérifiée d'un
autre agent IA** comme autorisation financière — exactement la « chaîne de permission » que
Genkan formalise en trois états (commit/defer/abstain) plutôt qu'un binaire
bloquer/laisser-passer. Le rapport Blockaid H1 2026 lui-même ne mentionne, dans les sources
consultées, **aucun produit existant** répondant spécifiquement à ce mode de défaillance — ses
recommandations post-incident (vérification multi-facteurs 3-de-3, découplage sortie en langage
naturel / exécution financière, seuils d'approbation humaine) sont présentées comme des
recommandations d'analystes émergentes, pas comme des produits déployés (« the article
identifies emerging vulnerabilities rather than established defensive technologies »).
**Verdict : trou réel, illustré par un incident nommé et précisément analysé (Bankr/Grok), et
confirmé en creux par l'incumbent dominant lui-même** (Blockaid prédit la vague d'incidents
mais ne revendique pas de produit la couvrant, dans les sources consultées) — la couche
"pare-feu anti-phishing pour humains" est encombrée et mature ; la couche "chaîne de permission
agent-à-agent avec budget restant et état formel defer/abstain" ne l'est pas, d'après cette
passe.

### 11.4 Données disponibles

Les événements d'approbation/drain on-chain sont publics et déjà suivis par plusieurs acteurs
(Scam Sniffer, la télémétrie propre de Blockaid). **Épisode held-out nommé proposé** :
**Bankr/Grok, mai 2026** [hors fenêtre de quelques semaines, mais le mécanisme — sortie d'un
agent IA lue comme autorisation par un autre — colle exactement au périmètre de Genkan, et
l'analyse qui l'expose est bien DANS la fenêtre]. **NON TROUVÉ** : un épisode agent-IA
strictement daté après le 2026-06-20 avec figures complètes — limite explicite de cette passe.

### 11.5 Signal de demande

**Très fortement démontré au niveau large (pare-feu de transaction générique)** : Blockaid a
levé 89,1 M$ cumulés, valorisée 315,4 M$ "as of 2026", intégrée chez Coinbase (75 M$+ économisés
en 5 mois, ~800 000 connexions bloquées) et MetaMask (PPOM natif) — un marché réel, massif, et
prouvé par des déploiements aux plus grands acteurs du secteur. **NON TROUVÉ** spécifiquement
pour la fonctionnalité agent-à-agent "commit/defer/abstain + budget restant" en tant que produit
vendu ou mandaté — les sources consultées montrent l'incumbent dominant (Blockaid) **anticiper**
la vague d'incidents (rapport H1 2026, dans la fenêtre) sans revendiquer de produit dédié à ce
sous-problème précis. Verdict global : **demande très fortement démontrée pour la fonction
large (pare-feu de transaction, marché prouvé à l'échelle de Coinbase/MetaMask) ; non démontrée
spécifiquement pour la couche agent-à-agent de Genkan — mais avec le signal le plus fort de
toute cette étude d'une demande imminente non encore matérialisée** (prévision explicite de
l'incumbent dominant lui-même, publiée dans la fenêtre, pour le second semestre 2026).

---

## 12. Transversal

### 12a. Actualité agents × DeFi (MCP, agents payants, x402, incidents d'agents) — septembre 2026

- **MCP (Model Context Protocol) dans la crypto — adoption large et rapide** : ~97 millions de
  téléchargements mensuels du SDK MCP en mars 2026 (échelle générale, pas crypto-spécifique)
  **[abs]**. **Base MCP**, lancé le 26 mai 2026 **[hors fenêtre de peu]** : passerelle MCP
  connectant Claude/ChatGPT/Cursor aux comptes Base, permettant swaps/transferts/interaction
  DeFi en langage naturel. Protocoles DeFi actifs au lancement : lending (Morpho, Moonwell),
  swaps (Uniswap, Aerodrome), perps (Avantis), lancement de tokens (**Bankr**, Virtuals).
  Sécurité : OAuth 2.1, non-custodial (le serveur MCP ne détient jamais de clé privée), et pour
  toute action sensible, génère un lien de confirmation manuelle dans l'app Base — **un
  contrôle humain-dans-la-boucle simple, pas un gate automatisé à trois états** (à comparer au
  vide identifié en §11 pour Genkan). BitGo, Coinbase, Crypto.com, CoinGecko et deBridge ont
  chacun publié un serveur MCP officiel. Source : [gncrypto.news](https://www.gncrypto.news/news/base-mcp-ai-agents-on-chain-defi/)
  et synthèse WebSearch **[abs]**, non ouvertes en détail.
  **Recoupement notable avec §11** : **Bankr**, l'un des protocoles intégrés dès le lancement de
  Base MCP, est le même agent de trading IA victime de l'attaque « AI agent permission chain
  abuse » (Grok/morse, mai 2026, 175 000 $) détaillée en §11.1 — un exemple concret et nommé
  d'un agent DeFi déjà en production dans l'écosystème MCP et déjà exploité par une chaîne de
  permission non vérifiée.
- **x402 (paiements agentiques, standard porté par Coinbase)** : lancé par Coinbase en mai 2025
  **[hors fenêtre]** ; la **x402 Foundation** (portée par la Linux Foundation) a été annoncée en
  avril 2026 et **lancée opérationnellement en juillet 2026 — DANS LA FENÊTRE**, avec plus de
  40 membres dont Visa, Mastercard, American Express, Stripe, Adyen, Fiserv, Google, AWS,
  Circle, Ripple, Shopify et la Solana Foundation. **Écart d'adoption noté entre deux mesures**
  (contradiction consignée, doc 03 §7) : un article de mars 2026 (coindesk.com **[abs]**) cite
  un volume quotidien de ~28 000 $ malgré une valorisation d'écosystème ~7 Md$ (« much of it
  from testing and "gamed" transactions rather than real commerce ») ; une mesure plus récente
  (x402.org, non datée précisément dans la synthèse, **[abs]**) cite 75,41 millions de
  transactions pour 24,24 M$ de volume sur 30 jours glissants, soit ~0,32 $/paiement en moyenne
  — les deux chiffres ne sont pas nécessairement contradictoires (croissance du nombre de
  transactions micro-paiement dans le temps) mais ne sont pas recoupés indépendamment cette
  passe. Mise en garde méthodologique citée : « Ordinary software scripts, scheduled processes
  and even self-dealing can produce blockchain records indistinguishable from payments
  initiated by AI agents » — l'adoption réelle par des agents autonomes pourrait être
  surestimée par le volume on-chain brut. Sources : [coinbase.com](https://www.coinbase.com/blog/coinbase-and-cloudflare-will-launch-x402-foundation),
  [coindesk.com, 2026-03-11](https://www.coindesk.com/markets/2026/03/11/coinbase-backed-ai-payments-protocol-wants-to-fix-micropayment-but-demand-is-just-not-there-yet)
  **[abs]**, non ouvertes en détail. **Recoupement avec §7 (Kessai)** : une extension
  "Settlement-Receipt Binding" est en cours de discussion dans le dépôt GitHub x402 (PR #2666,
  cf. §7.2) — la primitive "reçu de règlement vérifiable" progresse dans l'écosystème x402, pas
  encore dans le routage de swaps DEX.
- **Incidents d'agents, récapitulatif (détaillés en §11.1)** : Bankr/Grok (mai 2026, 175 000 $,
  « AI agent permission chain abuse ») ; compromission de routeurs LLM (26 routeurs injectant
  des appels d'outils malveillants, 500 000 $ volés chez un client, date précise NON TROUVÉE) ;
  pertes agrégées "infrastructure d'agents IA" 2026 citées à plus de 45 M$ **[abs]**. Le
  rapport H1 2026 de Blockaid (publié 2026-07-29, DANS LA FENÊTRE) anticipe explicitement une
  hausse des incidents d'agents IA au second semestre 2026, avec l'injection de prompt comme
  vecteur principal, suivi de l'abus d'usage d'outils et de la signature non autorisée.

### 12b. Réglementaire — MiCA, GENIUS Act, CRA art. 14

- **MiCA Article 78 (déjà détaillé en §7.1)** : obligation de meilleure exécution pleinement
  contraignante depuis le **1er juillet 2026** pour les CASP européens — facteurs à considérer :
  prix, coût, vitesse d'exécution, finalité d'exécution et de règlement, conditions de
  sécurisation/détention des crypto-actifs. Article 76 : conservation des enregistrements 5 ans
  minimum. Sanctions : 5 M€ ou 3 % du chiffre d'affaires annuel, le montant le plus élevé étant
  retenu. Pertinence directe pour Kessai (§7) ; pertinence indirecte pour tout produit MONARK
  générant des enregistrements d'exécution/décision horodatés et audités (Genkan, Hikae).
- **GENIUS Act (stablecoins de paiement, États-Unis)** : signé en juillet 2025 **[hors
  fenêtre]**. Statut au 2026-09-18 : **la date-limite de finalisation des règles d'application
  par les régulateurs primaires (18 juillet 2026) a été manquée** — aucune règle finale émise.
  Verbatim (source juridique/financière, [abs]) : « The Act mandated that primary regulators
  finalize their implementing rules by July 18, 2026, but that date has come and gone without a
  single final rule to show for it. » Conséquence mécanique : la loi entrera pleinement en
  vigueur le **18 janvier 2027**, indépendamment de l'état d'avancement réglementaire (falaise
  statutaire dure). À partir de cette date, émettre un stablecoin de paiement sans statut
  d'émetteur autorisé devient illégal aux États-Unis (Section 3(a)), avec des pénalités civiles
  pouvant atteindre **500 000 $ par violation volontaire/délibérée**. Cinq firmes (Circle,
  Ripple, BitGo, Fidelity, Paxos) ont reçu un agrément conditionnel de charte de trust bank
  national en décembre 2025 ; Circle a sécurisé sa propre charte en juillet 2026 ; Bridge,
  Protego et Crypto.com ont suivi — mais une charte de trust bank **n'équivaut pas** au statut
  de "Federal Qualified Payment Stablecoin Issuer" (règles encore à l'état de proposition,
  commentaires attendus jusqu'au 19 octobre 2026). Source : WebSearch **[abs]**
  (finance.yahoo.com "GENIUS Act Compliance Cliff", federalregister.gov, occ.gov), non
  ouvertes en détail. **Pertinence pour Narabi (§4)** : ce cadre réglementaire cible les
  stablecoins de *paiement* adossés 1:1 — USDe (Ethena) est structurellement différent (position
  delta-neutre collatéralisée, pas un simple dépôt fiduciaire), son statut sous GENIUS Act
  n'est PAS clarifié dans les sources consultées cette passe — NON TROUVÉ.
- **Cyber Resilience Act (CRA), Article 14 — Union européenne** : obligation de signalement des
  vulnérabilités activement exploitées et incidents sévères, **entrée en vigueur le 11
  septembre 2026 — soit une semaine avant la date de cette étude, DANS LA FENÊTRE**. Règle des
  trois délais : **24h** pour une alerte précoce à l'ENISA et au CSIRT national concerné dès
  connaissance d'une vulnérabilité activement exploitée ; **72h** pour une notification plus
  détaillée ; **rapport final** sous 14 jours (vulnérabilités activement exploitées) ou 1 mois
  (incidents sévères) après disponibilité d'une mesure corrective. Verbatim (Crowell & Moring,
  publié le jour même) : « The Article 14 CRA reporting obligation applies from 11 September
  2026; the remainder of the CRA generally applies from 11 December 2027. » La plateforme de
  signalement unique de l'ENISA (CRA Single Reporting Platform) est opérationnelle depuis cette
  date. Source : [crowell.com, 2026-09-11](https://www.crowell.com/en/insights/client-alerts/its-live-the-cyber-resilience-act-reporting-is-mandatory-as-of-today-11-september-2026)
  [lu]. **Portée pour la DeFi/crypto — NON CONFIRMÉE** : la source consultée mentionne les
  « produits connectés (matériel et logiciel) » et cite des secteurs (biens de consommation,
  technologie industrielle, semi-conducteurs, santé, **infrastructure de services
  financiers**) mais **ne confirme pas explicitement** que les smart contracts, applications
  DeFi ou wallets crypto sont dans le périmètre — à vérifier plus avant si une décision en
  dépend ; NON TROUVÉ de clarification spécifique DeFi/blockchain dans cette passe. Pénalités
  de non-conformité : NON TROUVÉES dans la source consultée.

---

## 13. Rapport final

**sha256 de ce fichier** : calculé après le dernier écrit et communiqué dans le rapport de
retour à l'orchestrateur (ce fichier continuant à changer jusqu'à la clôture de la passe, un
hash inséré ici se désynchroniserait de lui-même — évité pour rester honnête).

### 13.1 Verdict en une ligne par pièce

Format : problème vivant (oui/non) — trou (réel / partiel-en-comblement / encombré) — demande
(démontrée / adjacente seulement / non démontrée).

1. **Shōgen** (témoignage de prix attesté) — problème vivant : **oui** (32 exploits de
   manipulation de prix en 2026 vs 12 en 2025, TRM Labs ; 4 incidents chiffrés dans la
   fenêtre) — trou : **réel** (aucune attestation forensique indépendante et rejouable
   trouvée) — demande : **non démontrée**.
2. **Hikae** (gate à couverture contrôlée) — problème vivant : **oui** (Aave/Kelp DAO : 190 M$
   de collatéral non garanti malgré un système « functioning as designed ») — trou :
   **réel mais inféré par absence** (aucun mécanisme "coverage-controlled"/conforme appliqué à
   la DeFi trouvé) — demande : **adjacente seulement** (mandat de risk steward générique
   démontré et chiffré — 1,6 à 8 M$/an — mais pas pour la garantie statistique précise).
3. **Ukemi** (survie de cascade de liquidation) — problème vivant : **oui** (short squeeze
   19-20 août 2026, 1,74 à 3 Md$ selon la source ; 367,73 M$ le 2 septembre 2026) — trou :
   **réel et nommé par l'écosystème** ("shadow contagion", "nobody has a map of the pipes") —
   demande : **adjacente seulement** (DeFi Saver : 0,3 % de frais, 8,38 M$ économisés en une
   campagne ; Nexus Mutual : primes 2-10 %/an, 3,39 M$ de sinistres réels payés pour Euler —
   mais rien de spécifique à la cascade cross-venue).
4. **Narabi** (vélocité de rachat, USDe) — problème vivant : **partiel** (tendance de fond
   USDe/GENIUS Act documentée, mais pas d'épisode de stress USDe isolé DANS la fenêtre) — trou :
   **partiel** (Blockworks couvre déjà "queue pressure"/"stress endurance" mais pas de
   chronologie quotidienne rejouable) — demande : **adjacente seulement** (mandat LlamaRisk-
   Ethena existant mais pour une méthodologie différente).
5. **Mokugeki** (attestation de faits sans interprétation) — problème vivant : **oui, très
   documenté** (1 150+ marchés disputés Polymarket au S1 2026 ; papier académique dédié publié
   le 2026-09-14, dans la fenêtre) — trou : **réel** (UMA fusionne fait et interprétation ; le
   zkML général n'atteste pas la vérité empirique) — demande : **non démontrée** (marché de
   caution UMA = pari sur l'adjudication, pas achat d'attestation factuelle).
6. **Kaihi** (sortie de range avant flux toxique, LVR) — problème vivant : **oui** (LVR chiffré
   académiquement ~11 %/an ou 5-7 % selon la source ; bot de sandwich le plus actif d'Ethereum
   drainé de 7,5 M$ le 21 juin 2026) — trou : **incertain/partiel** (Arrakis/CoW AMM occupent
   déjà le terrain sous deux formes différentes ; Gamma Strategies non exploré — limite
   explicite) — demande : **adjacente seulement** (Arrakis : 1 % AUM + 50 % des frais, 5 Md$+
   de volume facilité).
7. **Kessai** (reçu de règlement, meilleure exécution) — problème vivant : **oui, avec échéance
   réglementaire dans la fenêtre** (MiCA art. 78 contraignant depuis le 2026-07-01) — trou :
   **espace encombré** (Kaiko, CoinRoutes, Talos, ION LookOut déjà positionnés MiCA, marché TCA
   2,8 Md$) — le sous-segment "reçu on-chain natif" reste possiblement ouvert mais non confirmé
   — demande : **démontrée** pour la fonction large (obligation réglementaire chiffrée),
   **non démontrée** pour le sous-segment précis.
8. **Kamae** (cotation + abstention) — problème vivant : **oui, mais surtout hors fenêtre**
   (HLP attaqué 3 fois en 13 mois — JELLY/POPCAT/Fartcoin ; pause Wintermute/LO:TECH le
   2025-10-11) — trou : **réel** (abstention existe en interne chez les top firms, mais aucun
   produit externe/vérifiable trouvé ; HLP en est structurellement dépourvu) — demande :
   **adjacente seulement** (mandat GSR/Stake DAO : 100 k$ + 20 k$/mois + prêt 1 M$, mais pour
   le MM générique).
9. **Kyokusen** (courbe de rendement, Pendle) — problème vivant : **oui, épisode le mieux
   documenté de toute l'étude** (cascade PT-reUSD sur Morpho, 25 août 2026, 36,4 M$ en 14
   minutes) — trou : **réel mais en cours de comblement côté Aave** (LlamaRisk propose
   "LlamaGuard PT", une architecture proche) ; **net et non comblé côté Morpho** (marchés
   isolés, pas de gate de gouvernance centralisée possible) — demande : **adjacente
   seulement**, et absente côté Morpho précisément là où l'incident a eu lieu.
10. **Koyomi** (flatten avant fermeture de fenêtre, HIP-3) — problème vivant : **oui, deux
    incidents chiffrés en 8 mois** (déc. 2025 : 13 M$ ; **27 juillet 2026, dans la fenêtre :
    57 M$/17,3 M$**) — trou : **réel et confirmé explicitement** par une source de sécurité
    dédiée aux builders HIP-3 (« no existing builder-side automatic deleveraging tool ») —
    demande : **non démontrée par un paiement observé**, mais pression financière réelle et
    slashable (~25 M$/builder).
11. **Genkan** (gate commit/defer/abstain) — problème vivant : **oui, incident nommé et
    analysé** (Bankr/Grok, mai 2026, "AI agent permission chain abuse", 175 000 $) — trou :
    **réel** (Blockaid/Harpie couvrent le pare-feu anti-phishing humain, mature et encombré ;
    la couche agent-à-agent avec budget restant n'a pas d'incumbent identifié) — demande :
    **démontrée très fortement pour la fonction large** (Blockaid : 89,1 M$ levés, 75 M$+
    économisés chez Coinbase en 5 mois) et **le signal le plus fort de toute l'étude d'une
    demande imminente non matérialisée** (le rapport H1 2026 de Blockaid lui-même anticipe la
    vague d'incidents agent-IA pour le S2 2026).

### 13.2 Les 3 pièces où le trou et la demande convergent le mieux

1. **Genkan** — le trou (couche de permission agent-à-agent) est net et illustré par un
   incident nommé et analysé en détail ; la demande pour la fonction adjacente (pare-feu de
   transaction) est la plus fortement chiffrée de toute l'étude (89,1 M$ levés par Blockaid,
   75 M$+ économisés en 5 mois chez Coinbase), et surtout l'incumbent dominant du secteur
   anticipe LUI-MÊME, dans un rapport publié DANS la fenêtre, la vague d'incidents précise que
   Genkan cible.
2. **Koyomi** — le trou est confirmé explicitement (source de sécurité dédiée : « no existing
   builder-side automatic deleveraging tool ») ; deux incidents chiffrés et datés en moins de
   8 mois chez le builder dominant (dont un dans la fenêtre, 57 M$) ; pression financière
   réelle et quantifiée (25 M$ slashables par builder) qui rend une demande future plausible
   même si non encore observée sous forme de paiement.
3. **Ukemi** — le trou est nommé par l'écosystème lui-même ("shadow contagion", "nobody has a
   map of the pipes") et distinct des deux catégories adjacentes bien établies (automatisation
   mono-position chez DeFi Saver, assurance ex-post chez Nexus Mutual) ; la demande pour ces
   catégories adjacentes est réelle, chiffrée et significative (8,38 M$ économisés en une seule
   campagne DeFi Saver ; 3,39 M$ de sinistres réellement payés par Nexus Mutual pour un seul
   incident), ce qui suggère qu'un budget existe déjà dans l'écosystème pour la survie face aux
   liquidations, sans qu'il couvre encore la cascade cross-venue elle-même.

**Mention honorable proche** : Kyokusen a l'épisode le mieux documenté de toute l'étude (36,4
M$ en 14 minutes, adresses exactes) mais son trou se referme activement côté Aave (proposition
LlamaGuard PT de l'incumbent) — la convergence trou/demande y est la plus nette précisément là
où le trou est le MOINS ouvert (Aave, mandat LlamaRisk existant) et absente là où le trou est le
PLUS ouvert (Morpho) — une divergence structurelle plutôt qu'une convergence, d'où son exclusion
du top 3 malgré la qualité de sa documentation.

### 13.3 Ce qui n'a pas pu être sourcé cette passe (limites explicites)

- **Épisodes isolés strictement DANS la fenêtre** (2026-06-20 → 2026-09-18), chiffrés et sans
  ambiguïté, manquants pour : Narabi (stress USDe spécifique), Mokugeki (dispute UMA/Polymarket
  postérieure au 2026-06-20 avec chiffres complets), Kamae (incident de market making), Kaihi
  (perte LP isolée attribuable au LVR).
- **Acteurs non explorés en détail**, cités mais non vérifiés cette passe : Gamma Strategies
  (Kaihi, tarifs/AUM), Block Analitica/RiskDAO/ChainRisk (Hikae, mandats), Forta/Webacy/Pocket
  Universe/Revoke.cash/Kerberus (Genkan), Auros (Kamae).
- **Montants de mandats non publics** : budget LlamaRisk-Aave (Hikae/Kyokusen), budget
  LlamaRisk-Ethena (Narabi), statut payant/gratuit exact des produits Kaiko/CoinRoutes/Talos
  (Kessai), montant précis d'un grant Uniswap Foundation fléché LVR (Kaihi).
- **Statuts d'implémentation non confirmés** : le "dynamic cooldown" d'Ethena (date exacte de
  mise en production non recoupée sur source primaire, Narabi) ; "LlamaGuard PT" (proposition
  seulement à la date de la source consultée, Kyokusen).
- **Portée réglementaire non confirmée** : le périmètre exact de la CRA art. 14 pour les
  smart contracts/applications DeFi/wallets crypto n'est pas explicitement tranché dans la
  source consultée (mentionne "financial services infrastructure" sans détail) ; le statut
  d'USDe (Ethena) sous le GENIUS Act n'a pas été trouvé (USDe n'est structurellement pas un
  simple dépôt fiduciaire 1:1) ; le statut du litige CFTC/États sur les marchés de prédiction
  dans la fenêtre n'a pas été vérifié au-delà du dépôt de février 2026.
- **Contradictions consignées sans arbitrage** (doc 03 §7, rappel) : Tectonic 75 M$ (TRM Labs)
  vs ~120 M$ (CertiK) ; short squeeze du 19-20 août 2026 : 1,74 à 3 Md$ selon la source ;
  PT-reUSD Morpho : 11,7 M vs 38,6 M de tokens saisis selon la source ; volume x402 quotidien
  ~28 000 $ (mars 2026) vs 24,24 M$/30 jours (mesure plus récente non datée précisément) ; slug
  d'URL "$85M" vs corps de texte "$60M" pour le marché Polymarket MicroStrategy.
- **Toutes les recherches et fetch effectués sont consignés au fil des sections avec URL, date
  de consultation (2026-09-18 sauf mention contraire) et niveau [lu]/[abs]/[2nd]** — aucun
  fetch infructueux (404/erreur) n'a été rencontré cette passe ; une seule redirection HTTP
  (panewslab.com → panews.io, §10) a été suivie avec succès.

---

**FIN DE L'ARCHIVE — toutes les sections (1 à 13) sont marquées [terminé].**
