# R-GTM-Bell — Journal des sources (GTM MONARK Bell)

**Gate 0.** Agent chercheur — modèle résolu : `claude-sonnet-5` (Sonnet 5), effort max, conforme.
**Date de la passe** : 2026-09-19. **Discipline doc 03** : [lu]/[abs]/[2nd] par finding ; chiffres copiés jamais reformulés (unité/dénominateur/signe/localisation) ; verbatim ≤ 30 mots ; NON TROUVÉ consigné plutôt qu'inféré ; contradictions rapportées sans arbitrage ; classes P1 (primaire)/P2 (presse-recherche indépendante)/P3 (blog/listicle, toujours signalé). Jamais l'advisor intégré pendant la collecte.
**Mission** : GTM de MONARK Bell. Document final : `F:\Monark\docs\GTM-BELL.md`.
**Infrastructure** : `mcp__memstack` — **ConnectionRefused** signalé par le harness au démarrage. Passe menée sans memstack ; item formé en procurement, non contourné.
**Note de processus** : une consultation de l'outil advisor intégré a été faite **après la fin de la collecte et après l'écriture des deux fichiers d'archive** (relecture du livrable, pas pendant l'extraction) — conforme à la consigne de mission. Elle a produit 4 items d'action (archive `_txt/`+sha256, hrefs des lettres 4-927, complétude du journal, un niveau de preuve à corriger), tous traités ci-dessous avant le rapport final.

---

## Note méthodologique sur les niveaux de preuve

- `[lu]` = document/page ouvert et son texte réellement extrait/lu.
- `[lu-WF]` = URL fetchée via WebFetch, contenu médié par un résumeur intermédiaire (pas le texte brut) ; citations verbatim seulement quand rendues explicitement entre guillemets.
- `[abs-WS]` = synthèse WebSearch (résumé multi-résultats), page non ouverte directement par l'agent.
- `[2nd]` = mention secondaire (chiffre cité par une source qui cite elle-même un tiers).
- `[interne]` = fait tiré d'un document interne MONARK déjà [lu] par un autre agent de la campagne (R1/R2/R3/L6/L7/L8/ADR-B0/CHANTIERS/DECISIONS/PROPOSITIONS), reporté ici avec sa référence d'origine.

---

## Sources internes lues intégralement (base de la mission)

| Document | Emplacement | Statut |
|---|---|---|
| PROPOSITIONS-tokenized-stocks-2026-09-19.md | `C:\Users\KACIMI\Downloads\PRODUITS\etude-2026-09-19\` | [lu] intégral |
| R1-paysage-marche.md, R2-reglementaire.md, R3-gaps-techniques.md | idem | [lu] intégral (les trois) |
| L6 (Cong et al.), L7 (SEC 34-106402 + IAC), L8 (Scharnowski) | idem | [lu] intégral (les trois) |
| DECISIONS-investisseur-2026-09-19.md, ANNONCE-X-bell-ukemi-2026-09-19.md | idem | [lu] intégral |
| **ADR-B0-programme-bell.md** | `F:\Monark\docs\adr\` | [lu] intégral — **non listé dans la mission mais directement autoritaire sur l'objet Bell** (D1-D9) ; trouvé en reconnaissance (grep « massive »). **Le fichier a été modifié sur disque par un autre worker pendant cette passe** (rédaction concurrente, même campagne) ; la version utilisée ici est la version **finale relue** (VPS `bell.monarkgate.tech`, clé Ed25519, D8 Définition de fini, D9 renvoi explicite vers ce document GTM). |
| CHANTIERS.md (extraits) | `F:\Monark\docs\` | [lu] ciblé (licence Massive/Polygon L35/L37/L80) |
| GTM v1 (00,01,02,03,06,07,09,10 extrait) | `C:\Users\KACIMI\Downloads\GTM monark version 1\GTM\` | [lu] — structure/ton/interdits (produit différent, ClawPump/token, non réutilisé comme source de fait) |

**Fait interne central [interne, lu] CHANTIERS L35/L37/L80 + ADR-B0 D6/D8/PR-B-3** : abonnement **Massive/Polygon Stocks Starter, 29 $/mois**, clé `POLYGON_API_KEY`, testée 2026-09-19 (TSLA prev close 364,27 $). Licence **« Individual Use »** — confirmé et identifié en détail par recherche web ce jour (voir §3 ci-dessous) : **Massive = Polygon.io rebaptisé début 2026** [abs-WS, GitHub api-evangelist + massive.com]. Avis écrit requis avant toute publication dérivée (PR-B-3, « tentatives : à former », non reçu à la date de cette passe).

**ADR-B0 D9 (verbatim proche)** : « GTM (annonce de l'objet ; le GTM lui-même = lot séparé)… Renvoi : `docs/GTM-BELL.md` à produire par advisor-marché + chercheur (lot séparé, hors périmètre code de cet ADR) — l'ADR annonce l'objet, ne rédige pas le GTM. » Cibles nommées par l'ADR (reprises de l'étude) : Gauntlet (Ondo/Morpho), Steakhouse, Kamino ; TSV candidats (Notice item i) ; examinateurs SEC ; presse ; File 4-927.

**Périmètre v1 précisé par ADR-B0 Contexte 4 [interne, lu]** : xStocks + Ondo ≈ **47 %** du marché (837,9 + 541,2 = 1 379,1 / 2 910 M$, RWA.xyz 2026-09-19) — PAS 95 % (ce chiffre est celui de Cong oct. 2025, cap. 420 M$, daté). **bStocks (Binance) ≈ 26 % du marché, HORS périmètre v1** (item formé). Registre : « MONARK Bell » inscrit `upcoming` dès T-1, `built` seulement à l'atteinte de la **Définition de fini** (D8), pas au seul test d'intégration — implique un invariant de langage dans le GTM (ne jamais présenter Bell comme « built »/« live » avant D8).

---

## Findings — recherche web (2026-09-19)

### 1. TSV candidats — statut de candidature post-ordre 2026-09-17

**[lu-WF] CoinDesk, Krisztian Sandor, « SEC opens door to tokenized U.S. stock trading. Here's who could benefit »**, 2026-09-17 (coindesk.com/business/2026/09/17/sec-opens-door-to-tokenized-u-s-stock-trading-here-s-who-could-benefit). Citations exactes obtenues par fetch dédié (guillemets rendus par l'outil), page archivée localement (§9) :
- **Securitize** — Carlos Domingo, CEO : « This is extremely positive because it gives a way to trade real tokenized stocks. » Action Securitize +14 % le jour même [abs-WS].
- **Bullish** — Thomas Cowan, global head of tokenization : « It's showing that regulators are thinking about how to enable AMMs and new market structure. » et « It is definitely not a broad opening that the crypto community was looking for...but it is a fantastic start. »
- **Dinari** — Gabo Otte, CEO : « The SEC is drawing an important line around what tokenized equities should actually represent » ; complété [abs-WS] : « putting stocks onchain shouldn't mean stripping away the rights that make them stocks in the first place. »
- **Robinhood** — Johann Kerbrat, crypto head : « The SEC innovation exemption is a signal that tokenization is ready to come to the United States. This is a major step » ; [abs-WS] complète : « will allow liquid tokenized securities markets to develop onshore. »
- **Superstate** — Robert Leshner, CEO : « I expect over the coming weeks, months we'll see issuers rethink products to conform with these rules. »
- **Aerodrome/Dromos Labs** — Jim Petrila, chief legal officer : « The SEC's innovation exemption is a meaningful, directionally bullish signal for DeFi. »
- **Coinbase (COIN)** : action +12 % le jour de l'annonce [abs-WS, Seeking Alpha 2026-09-19]. Pas de citation dirigeante trouvée sur une intention explicite de candidature TSV dans cette passe — CFO Alesia Haas citée (conférence Goldman Sachs, 11 sept. 2026, [abs-WS]) sur trois voies génériques vers la clarté réglementaire, pas spécifique au TSV.
- **Kraken (xStocks) / Ondo** : [abs-WS, CoinDesk] « Kraken's xStocks and Ondo Finance's offshore products, which give investors price exposure to U.S. equities without making them shareholders, would need to change their models if providers want to use the SEC's new U.S. pathway. » — **aucune annonce de candidature TSV trouvée pour l'un ou l'autre à la date de cette passe** (NON TROUVÉ).
- **Nasdaq / DTCC** : voies réglementaires **distinctes et antérieures** (SR-NASDAQ-2025-072, approuvé 25 mars 2026 ; DTCC No-Action Letter déc. 2025) — pas de déclaration trouvée reliant ces initiatives au statut spécifique « TSV » de l'ordre du 17 sept. 2026 (NON TROUVÉ).

**[lu-WF] The Block, Sarah Wynn, « It's here — SEC releases long-awaited innovation exemption… »**, 2026-09-17, 9:00 AM EDT (theblock.co/news/regulation/2026-09-17-sec-releases-innovation-exemption-415324, page archivée localement §9). Citations : « Those exempt venues would have to comply with sanctions rules » ; « The exemption does not include synthetics...and issuers can deny their security from trading on the venue. » **Aucune réaction d'entreprise nommée dans cet article** [lu-WF, vérifié] ; **aucune mention de vérification/mesure/audit indépendant** — cohérent avec le constat L7 (« aucun tiers indépendant exigé »).

**Blockworks** — recherche dédiée (2 requêtes distinctes) : **NON TROUVÉ** d'article Blockworks sur l'ordre du 17 sept. 2026 dans les résultats retournés. Ne pas conclure à une absence de couverture (probable, juste non remontée par cette recherche) — à retenter par une passe ultérieure si le segment presse en a l'usage.

### 2. Antécédent — lobbying des transfer agents contre les tokens tiers (2026-07-13, avant l'ordre)

**[lu-WF] CoinDesk, Krisztian Sandor, « Battle over blockchain stock ownership is heading to Washington regulators »**, 2026-07-13 (coindesk.com/policy/2026/07/13/wall-street-transfer-agents-lobby-sec-warning-that-third-party-tokens-pose-risks-to-market-integrity, page archivée localement §9). La **Securities Transfer Association (STA)** avertit : détenteurs de tokens tiers « face the credit, custody and operational risks of the platform issuing those tokens » ; verbatim STA : « An Issuer-Sponsored Token is an actual share or other security of the Corporation. » Transfer agents nommés : **Computershare** (>50 % du S&P 500), **Equiniti** (en cours de rachat par Bullish), **Fairmint** (transfer agent SEC natif on-chain). Émetteurs/tokenisation nommés : Figure Technologies, Securitize, Ondo Finance, Kraken (xStocks), Dinari, tZERO, Centrifuge. **Pertinence pour le GTM** : segment adjacent non listé explicitement par la mission — des incumbents (transfer agents) qui ont un intérêt structurel à voir documentée la différence issuer-sponsored vs third-party pourraient constituer une audience favorable au témoin Bell, sans qu'aucune demande n'ait été observée de leur part (extrapolation signalée comme telle, pas un fait).

### 3. Identité de « Massive » (licence Individual Use — risque §7)

**[abs-WS] GitHub api-evangelist/polygon** (description du dépôt) + **massive.com** (page stocks/docs) : « Polygon (Polygon.io, rebranded as Massive in early 2026) provides real-time and historical market data APIs across US stocks, options, indices, forex, cryptocurrencies, and futures… tiered subscription plans » ; « Individual plans (Basic → Advanced) are licensed for personal and non-professional use… Business contracts [required] for redistribution and exchange-licensed data. » **Confirmation** : Massive = Polygon.io lui-même (rebranding), pas un tiers revendeur. Le plan « Individual Use » souscrit par MONARK (CHANTIERS L35) est structurellement **non prévu pour republication** — cohérent avec le procurement PR-B-3 déjà formé par ADR-B0.

### 4. Curateurs de risque — précédents de pricing et périmètre exact

**[abs-WS] Messari + governance-v2.aave.com + coindesk.com (2024-02-27)** : Gauntlet a quitté Aave pour Morpho fin février 2024. **Aave payait Gauntlet 1,6 M$/an** comme « risk steward », montant **réduit depuis 2 M$** pour s'aligner sur le tarif concurrent Chaos Labs [abs-WS, non daté précisément au-delà de « avant le départ 2024 »].
**[lu-WF] governance.aave.com, ARFC Chaos Labs Scope and Compensation Amendment**, posté **9 août 2023** (page archivée localement §9) : proposition **« $400,000 increase, bringing our total annual compensation to $1.5M »**, périmètre V2/V3/GHO ; commentaires communautaires notant un **budget combiné ≈ 3 M$/an pour Chaos Labs + Gauntlet** ensemble. **Ces chiffres sont datés 2023-2024, portent sur la gestion de risque crypto générale d'Aave, PAS sur un mandat spécifique aux actions tokenisées** — à traiter comme un ordre de grandeur du marché de la « mesure de risque tierce payée », pas comme un prix pour un produit Bell. **NON TROUVÉ** : montant 2026 spécifique à un mandat actions tokenisées.
**[abs-WS] Steakhouse Financial (morpho.org/stories/steakhouse, 2026)** : « largest curator on Morpho, managing 48 vaults… generating $0.5M+ annual recurring revenue (and growing) ». **[lu-WF] docs.morpho.org/curate/concepts/fee/** : fee de performance plafonné à **50 % du rendement généré** + fee de gestion continu sur l'actif total déposé. Steakhouse curate les vaults xStocks sur Morpho Ethereum (R1 §3.2, [abs-WS]).
**[abs-WS] Kamino V2 (recherche 2026)** : curateurs nommés — **Allez Labs, Gauntlet, Rockaway, Steakhouse Financial, Sentora, Re7 Capital** — **confirme** l'attribution « Gauntlet/Steakhouse » de PROPOSITIONS §2 pour Kamino (pas de contradiction trouvée). Marché xStocks Kamino : « using Chainlink-powered data infrastructure with a **price band mechanism** to manage risk during illiquid trading periods » [abs-WS, non calibré publiquement — aucune méthodologie de calibration trouvée]. Chiffres : **6,3 M$ USDC fournis / 5,75 M$ empruntés, 92 % d'utilisation, avril 2026** [abs-WS, theblock.co cité] — **distinct** du chiffre R3 §4.2 (23,1 M$ TVL, date non précisée) ; les deux chiffres ne sont **pas réconciliés** (périmètres/dates possiblement différents), rapportés tels quels.

### 5. Positionnement — Credora (score) et RWA.xyz (agrégation)

**[abs-WS] dlnews.com + blog.redstone.finance (6 nov. 2025) + credora.network/docs** : **RedStone a acquis Credora en septembre 2025.** Credora se positionne comme « the first and largest unified platform combining pricing, collateral, and credit risk intelligence for DeFi ». Méthodologie : « Asset methodologies output a **Probability of Default (PD)**, while product methodologies (loan pairs, vaults, pools) output a **Probability of Significant Loss (PSL)** » sur une échelle « Credora PD Curve » commune. **Fait notable pour le positionnement Bell** : Credora publie explicitement des **probabilités** — exactement la classe de langage que la doctrine MONARK interdit (« pas de score, pas de probabilité »), et RedStone (concurrent prix nommé par la mission) possède maintenant Credora (concurrent score) — convergence prix+score chez un même acteur, à l'opposé de la doctrine « mesurer, jamais scorer/pricer » de Bell.
**[lu-WF] docs.rwa.xyz/methodology/overview** (page archivée localement §9) : « Every data point comes from its primary source. Reference data… comes directly from issuers. Transfer and holder metrics are computed from on-chain transactions. Pricing comes from exchanges or the fund administrator… » ; « We don't rely on second-hand aggregations when the original source is available. » ; « When data is uncertain or unavailable, we leave fields blank rather than display potentially inaccurate information. » **Aucune déclaration trouvée** sur un audit ou une vérification indépendante des chiffres reçus des émetteurs (silence documentaire, pas une preuve d'absence). **[abs-WS] rwa.xyz/blog** : cadre « Distributed vs Represented Assets » — distingue les tokens transférables hors plateforme (Distributed) des tokens verrouillés (Represented) ; méthodologie de comptage du marché a changé récemment sur cette base [abs-WS].

### 6. Pricing — précédents pour l'offre Bell

**[lu-WF] kaiko.com/about-kaiko/pricing-and-contracts** (page archivée localement §9) : **aucun chiffre public** — « Kaiko creates custom data plans for our enterprise clients dependent on: number of assets/instruments, data type, granularity, historical vs. live access, and usage » ; renvoie à « Contact us » / « Request a Trial ». **[abs-WS] Datarade/Vendr (sites tiers, P3, non primaires)** citent des paliers L1/L2 crypto (1 000-2 500 $/mois) — **non confirmés par la source primaire Kaiko elle-même**, à traiter avec prudence, ET hors périmètre (crypto tick data, pas actions tokenisées).
**Chainlink PoR — tarification commerciale** : recherche dédiée, **NON TROUVÉ** de grille publique. [abs-WS, cryptodaily.co.uk août 2026] note un virage stratégique Chainlink vers des « fee-based LINK agreements » (remplaçant le programme BUILD par des accords commerciaux), sans chiffre. Confirme le NON TROUVÉ déjà consigné par R3 §6.1.
**[abs-WS, synthèse convergente WebSearch de docs Coinbase/Cloudflare]** x402 : « Most current deployments price in single-digit cents per call » ; **CoinGecko** facture **0,01 $ (USDC) par requête** sur ses endpoints de données de marché ; l'exemple de référence **Circle** paie **0,01 $ USDC** pour une donnée de profil de risque wallet ; **Cloudflare Monetization Gateway** cite des tarifs d'exemple « $0.01 per GET or POST… up to $2.00 for compute-heavy tasks ». Cohérent avec le chiffre déjà connu de la mission (« x402 0,01 $/appel ») — **confirmé comme un point de comparaison de marché pour micro-paiements d'API de données**, pas un prix Bell.

### 7. File No. 4-927 — dossier de commentaires (mis à jour post-relecture advisor)

**[lu-WF] sec.gov/rules-regulations/2026/09/4-927** : page de règle confirmée (Release 34-106402, File 4-927), lien de soumission « Submit a Comment on 4-927 », lien « View Received Comments ». **Aucun délai de commentaire affiché sur cette page** (NON TROUVÉ — le communiqué SEC dit l'exemption effective immédiatement ; la fenêtre de commentaire elle-même n'a pas de date de clôture identifiée dans cette passe).
**[lu-WF] sec.gov/rules-regulations/public-comments/4-927** : **8 lettres déposées entre le 17 et le 18 septembre 2026** (soit dans les 24-48 h suivant l'ordre), avec URL individuelle de chaque lettre obtenue par un second fetch dédié demandant explicitement les hyperliens :

| Déposant | Date | Organisation | URL individuelle |
|---|---|---|---|
| Tyrone V. Ross Jr. | 2026-09-17 | CEO/Founder, Turnqey Labs | `/comments/4-927/4927-1052379-3611846.html` |
| Douglas Borthwick | 2026-09-17 | Founder, The Insumer Model LLC | `/comments/4-927/4927-1052439-3612229.pdf` |
| Aaron Delderfield | 2026-09-17 | Pristine Requirements Optimised (PRO) | `/comments/4-927/4927-1051719-3608470.html` |
| Ross P. Brown | 2026-09-17 | — | `/comments/4-927/4927-1051619-3607766.html` |
| Landon Redoutey | 2026-09-17 | — | `/comments/4-927/4927-1053379-3620550.html` |
| Takahiro Morita | 2026-09-18 | — | `/comments/4-927/4927-1053619-3627147.html` |
| Nicholas Templeman | 2026-09-18 | — | `/comments/4-927/4927-3629006.htm` |
| Cody L. | 2026-09-18 | — | `/comments/4-927/4927-3633378.htm` |

**Les 3 lettres organisationnelles ont été ouvertes (WebFetch dédié, question : demande-t-elle une mesure/vérification/audit indépendant ?)** — résultat nuancé, à ne pas sur-lire :
- **Ross (Turnqey Labs) [lu-WF]** — pas de demande explicite d'audit tiers/oversight externe. Citation rendue entre guillemets par l'outil : « the rights parity verification the order requires is unverifiable from outside. » L'analyse de l'outil indique que la lettre recommande la **publication de données standardisées machine-readable** permettant aux participants de **réconcilier eux-mêmes leurs positions** — proche du modèle Bell (faits publics recalculables par un tiers) mais **distinct** d'une demande d'auditeur/organe de surveillance externe. **Ne pas présenter comme « réclame un témoin indépendant »** : c'est une lecture, pas la formulation de la lettre.
- **Borthwick (The Insumer Model LLC) — [ÉCHEC D'EXTRACTION FIABLE]**. Fichier PDF ; la première réponse de l'outil s'est contredite en cours de réponse (« Yes » puis « cannot locate this exact phrase… cannot be reliably extracted from this PDF format with confidence »). **Traité comme NON TROUVÉ / non fiable**, pas comme une confirmation ni une infirmation. PDF brut sauvegardé localement (échec HTTP 403 en téléchargement direct curl, voir §9) — à retenter avec un pipeline `pdftotext` si le signal a un usage produit.
- **Delderfield (PRO) [lu-WF]** — **hors sujet** : le contenu porte sur « existential risk mitigation », systèmes IA et infrastructure spatiale, pas sur la vérification des TSV. Aucune demande de mesure indépendante liée aux actions tokenisées. Illustre que **les dossiers de commentaires SEC contiennent du bruit** (lettres individuelles non pertinentes) — à filtrer, pas à compter comme un signal de demande.

**Conséquence pour le signal « confirme » (PROPOSITIONS §6 / GTM §6)** : sur 3 lettres organisationnelles vérifiées, **aucune ne réclame explicitement un témoin/audit tiers au sens où PROPOSITIONS §6 l'entend** ; une (Ross/Turnqey) documente un problème de vérifiabilité externe de la condition E et propose une solution voisine (données publiques machine-readable) sans nommer un tiers vérificateur. **Le signal « confirme » reste donc NON déclenché**, mais avec une nuance nouvelle et sourcée plutôt qu'un simple « non vérifié ». Les 5 lettres individuelles restantes (Brown, Redoutey, Morita, Templeman, Cody L.) n'ont pas été ouvertes (budget de passe) — NON TROUVÉ pour ces 5, procurement maintenu en version réduite (voir §11).

### 8. Option Stocklana (hackathon, note factuelle seulement — décision déjà prise, DECISIONS point 7)

**[abs-WS] solanacompass.com, 2026-09** : « STOCKLANA opened September 11 as the first competition on Solana Foundation's new hackathons.solana.com platform, with a $100,000 prize pool… Meteora, Pyth Network, PreStocks, Clawpump, and Tessera joined STOCKLANA, adding five tracks and raising the prize pool to **$121,000**, with the submission deadline extended to **September 25 at 4 PM ET** ». Piste Pyth : « Best use of Pyth market data — build a Solana app where live financial data does real work », jugée sur centralité de Pyth, qualité technique, survie post-hackathon. Cohérent avec DECISIONS point 7 (dépôt 2026-09-25 16h ET, 100 k$ + piste Pyth, piste Clawpump = conflit exclue). **Aucune action nouvelle requise** : plan inchangé (décision investisseur), note factuelle seulement.

### 9. Archive locale et empreintes sha256 (fait post-relecture advisor)

Pages sauvegardées via `curl` (agent HTTP direct, indépendant de WebFetch) dans `F:\Monark\docs\biblio\bell\_txt\` :

| Fichier | URL | HTTP | Octets | SHA-256 |
|---|---|---|---|---|
| `coindesk-who-could-benefit.html` | coindesk.com/business/2026/09/17/… | 200 | 1 772 613 | `0beeb3a18f76b915df9ce42fb4b82f1572f30307c364186f40cf2291360360b4` |
| `coindesk-transfer-agents-lobby.html` | coindesk.com/policy/2026/07/13/… | 200 | 1 769 758 | `764c2d939b0e9ea7960affdd88a4012106c8a4f32d14e7ae6cd77446b57d1f4e` |
| `theblock-innovation-exemption.html` | theblock.co/news/regulation/2026-09-17-… | 200 | 580 608 | `79e0b36d17e22bb9c71996d00941329f9f30eb0f286a0b8237fcdfd8925125ea` |
| `rwaxyz-methodology.html` | docs.rwa.xyz/methodology/overview | 200 | 230 149 | `438591e167c6830cd8f66c82881cb9c5b0e0fe3e1c333f56dbe6e39a40e05121` |
| `kaiko-pricing.html` | kaiko.com/about-kaiko/pricing-and-contracts | 200 | 167 642 | `f3355ee443d70729e41015cc4ceccbc194a330fed500041c4b8136b10c74c097` |
| `aave-chaoslabs-comp.html` | governance.aave.com/t/arfc-chaos-labs-…/14407 | 200 | 286 756 | `8c6a27ebbf2a9ebab4e008d1d05c8682fa6468e4d7b7369d95b864888cfb7d6c` |
| `sec-4927-rule.html` | sec.gov/rules-regulations/2026/09/4-927 | **403** | 1 925 | `6a8004f3e1349aa93d11eb0653173b6b69e269912f1dc0cd67cfdbda88d33ce1` |
| `sec-4927-comments-list.html` | sec.gov/rules-regulations/public-comments/4-927 | **403** | 1 925 | `b935947bf7e7d8f6ed24ac17e52d7f3d1efc392556a79a25672e937328fe3415` |
| `sec-4927-comment-ross-turnqey` | sec.gov/comments/4-927/4927-1052379-3611846.html | **403** | 1 925 | `f53244a029c59f26bc62519c944d0d421d39d446feb16f2d85c25854bcbeac34` |
| `sec-4927-comment-borthwick-insumer` | sec.gov/comments/4-927/4927-1052439-3612229.pdf | **403** | 1 925 | `4f98d058aadc425b0a5f1d868e81794d48c220d943b58137a48603402bb00329` |
| `sec-4927-comment-delderfield-pro` | sec.gov/comments/4-927/4927-1051719-3608470.html | **403** | 1 925 | `203dff96b74f815926476973c074885da9fdd03f7400f8f065a3338db5742b2c` |

**Toutes les URL `sec.gov` renvoient HTTP 403 « Request Rate Threshold Exceeded » en accès direct `curl` (2 tentatives distinctes, headers navigateur complets, résultat identique)** — un WAF applicatif limite le débit ou bloque l'agent HTTP direct depuis cet environnement, **indépendamment** du chemin réseau utilisé par l'outil WebFetch (qui, lui, a réussi à lire ces mêmes pages, voir §1/§7). Les 5 fichiers sec.gov ci-dessus sont donc des **pages d'erreur WAF identiques (1 925 octets), pas le contenu** — archivées telles quelles pour preuve de la tentative, pas comme source de fait. Aucun sha256 de contenu réel n'est donc disponible pour les pages sec.gov dans cette passe ; le contenu utilisé reste [lu-WF] via l'outil, jamais [lu] au sens strict pour ces URL précises.

---

## Contradictions relevées (cette passe)

1. **Chiffres Kamino xStocks** : 6,3 M$ fournis / 5,75 M$ empruntés, avril 2026 [abs-WS ce jour] vs 23,1 M$ TVL, date non précisée [R3 §4.2] — non réconciliés, périmètres/dates possiblement différents.
2. **Niveau de preuve Ross/Turnqey** : la première phrase de la réponse de l'outil WebFetch minimise (« does not explicitly request ») puis produit une citation qui va dans un sens plus favorable à la lecture « problème de vérifiabilité externe reconnu » — les deux formulations de l'outil lui-même ne sont pas parfaitement alignées ; la citation verbatim fait foi, pas le résumé de l'outil.

## NON TROUVÉ (consolidé, cette passe)

- Annonce explicite de candidature/inscription TSV par Coinbase, Kraken, Ondo, Nasdaq ou DTCC sous l'ordre du 17 sept. 2026 spécifiquement.
- Grille de prix publique Chainlink Proof of Reserve pour émetteurs RWA (silence confirmé, 2e recherche indépendante de celle de R3).
- Grille de prix publique Kaiko au-delà de « contact us » (primaire) ; chiffres 1 000-2 500 $/mois trouvés seulement via sites tiers P3.
- Mandat 2026 spécifique « actions tokenisées » payé à un curateur de risque (Gauntlet/Chaos/Steakhouse) — seuls des mandats crypto généraux 2023-2024 trouvés.
- Contenu fiable de la lettre Borthwick/Insumer Model (échec d'extraction PDF, réponse d'outil contradictoire) ; contenu des 5 lettres individuelles non organisationnelles (Brown, Redoutey, Morita, Templeman, Cody L.).
- Délai de clôture de la période de commentaire de File 4-927.
- Couverture Blockworks de l'ordre du 17 sept. 2026 (recherche dédiée infructueuse, ne pas conclure à une absence).
- Registre public listant les Notices TSV effectivement déposées auprès de la SEC (condition C).
- Toute déclaration RWA.xyz sur l'audit/la vérification indépendante de ses données issuer-reported (silence, pas une preuve d'absence).
- Contenu réel des pages sec.gov en accès direct (curl) — WAF bloquant systématiquement, voir §9.

## Procurements formés (cette passe, en plus de ceux déjà ouverts par ADR-B0/R1-R3)

1. **Lettre Borthwick/Insumer Model (PDF)** — extraction fiable. Tentative : WebFetch (réponse contradictoire, non exploitable) ; curl direct → 403 WAF. Usage : trancher si elle réclame une mesure indépendante. Action demandée : `pdftotext` sur le PDF si récupéré autrement (accès institutionnel, ou nouvelle tentative WebFetch isolée).
2. **5 lettres individuelles restantes** (Brown, Redoutey, Morita, Templeman, Cody L.) — non ouvertes, budget de passe. Usage : compléter le signal « confirme » §6 GTM.
3. **Ordre 34-106402 (PDF complet)** — pour la date de clôture exacte de la période de commentaire. Déjà signalé par R3 (PDF binaire non décodé) ; usage doc 03 §6 : `pdftotext` sur le PDF déjà en cache local (chemins R3 Procurements #1bis).
4. **Grille tarifaire Chainlink PoR pour émetteurs RWA** (contact commercial direct) — borne de pricing offre « rapport attesté » Bell.
5. **Devis Kaiko primaire** (contact sales, pas de grille publique) — même usage.
6. **Blockworks — couverture de l'ordre du 17 sept. 2026** — recherche alternative (moteur interne Blockworks, archive.org).

## Journal des URL (succès et échecs, cette passe)

### Succès [lu-WF] ou [lu]
1. coindesk.com/business/2026/09/17/sec-opens-door-to-tokenized-u-s-stock-trading-here-s-who-could-benefit — archivé §9
2. coindesk.com/policy/2026/07/13/wall-street-transfer-agents-lobby-sec-warning-that-third-party-tokens-pose-risks-to-market-integrity — archivé §9
3. theblock.co/news/regulation/2026-09-17-sec-releases-innovation-exemption-415324 — archivé §9
4. docs.rwa.xyz/methodology/overview — archivé §9
5. www.kaiko.com/about-kaiko/pricing-and-contracts — archivé §9
6. governance.aave.com/t/arfc-chaos-labs-scope-and-compensation-amendment/14407 — archivé §9
7. sec.gov/rules-regulations/2026/09/4-927 — [lu-WF] seulement (curl bloqué, §9)
8. sec.gov/rules-regulations/public-comments/4-927 — [lu-WF] seulement, 2 passes (liste + hrefs)
9. sec.gov/comments/4-927/4927-1052379-3611846.html (Ross/Turnqey) — [lu-WF] seulement
10. sec.gov/comments/4-927/4927-1051719-3608470.html (Delderfield/PRO) — [lu-WF] seulement

### Échecs
- sec.gov/comments/4-927/4-927.htm — HTTP 404 (1ère URL devinée, schéma incorrect).
- sec.gov/comments/4-927/4927-1.htm — HTTP 404 (2e URL devinée, schéma incorrect).
- sec.gov/comments/4-927/4927-1052439-3612229.pdf (Borthwick/Insumer) — [lu-WF] réponse contradictoire non exploitable ; curl → HTTP 403 WAF.
- 5× sec.gov (§9) — HTTP 403 « Request Rate Threshold Exceeded » en curl direct, 2 tentatives chacune, headers navigateur complets, résultat identique.

### WebSearch (synthèses [abs-WS], 18 requêtes numérotées cette passe)
1. SEC File 4-927 comment letters tokenized securities venue innovation exemption
2. Coinbase Nasdaq Kraken Robinhood "Tokenized Securities Venue" apply September 2026
3. Gauntlet Chaos Labs governance proposal risk mandate fee Aave Morpho amount
4. Credora risk score RWA DeFi pricing product
5. Kaiko market data pricing API subscription tiers crypto
6. x402 protocol Coinbase Cloudflare "$0.01" per call pricing example
7. "The Block" OR "Blockworks" tokenized stocks SEC innovation exemption September 2026 analysis
8. RWA.xyz methodology "distributed value" how it tracks tokenized assets business model
9. site:sec.gov comments 4-927
10. Kraken xStocks Ondo Dinari Securitize reaction statement "innovation exemption" tokenized securities venue plan register
11. Nasdaq Coinbase reaction statement SEC innovation exemption tokenized September 17 2026
12. Steakhouse Financial curator fee Morpho vault compensation governance
13. Chainlink Proof of Reserve pricing commercial fee RWA issuer enterprise
14. "File No. 4-927" comment period deadline days SEC innovation exemption
15. Stocklana hackathon Solana Foundation Pyth track prize tokenized stocks 2026
16. "Massive" stock market data API "Individual Use" license Polygon.io wrapper
17. blockworks.co tokenized stocks SEC exemption (2e requête Blockworks)
18. Kamino Finance risk curator xStocks lending market parameters team
19. Tyrone Ross Turnqey Labs comment letter SEC tokenized securities venue File 4-927 (infructueuse, contenu trouvé par WebFetch direct à la place)
20. Douglas Borthwick "Insumer" comment letter SEC tokenized stocks innovation exemption (infructueuse)

---

## Renvoi

Document final : `F:\Monark\docs\GTM-BELL.md`. Toute donnée de ce journal y est reprise avec son niveau de preuve ; ce journal reste la source de vérification (URL, dates, verbatim, sha256) — le GTM ne remplace pas ce journal, il le synthétise.
