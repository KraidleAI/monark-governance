MODELE RESOLU : claude-sonnet-5

# Census v4 — Émetteurs d'actions tokenisées (2026-09-20)

**Date** : 2026-09-20. **Modèle** : `claude-sonnet-5`, effort max. **Méthode** : émetteur ≠ venue (règle investisseur 2026-09-19) — chaque ligne identifie l'entité légale qui doit le wrapping, pas la plateforme de distribution (Kraken/Jupiter/Pionex/Raydium/Sunrise/Binance Spot = tuyaux, exclus). **Statut de l'apport investisseur** : `F:\PRODUITS\etude-2026-09-20\census-investisseur\APPORT-INVESTISSEUR-census-emetteurs-2026-09-20.md`, apport verbatim, tous chiffres relus cette passe. **Détail complet (citations, journal des URL, contradictions, niveau par cellule)** : `F:\PRODUITS\etude-2026-09-20\census-investisseur\VERIFICATION-census-emetteurs-2026-09-20.md`. Niveaux : [lu-WF] = page lue directement (extraction médiée par l'outil de fetch, pas octet-exact) ; [abs-WS] = résumé de recherche, traité comme [2nd] ; NON TROUVÉ = tenté et consigné.

## Table Solana — émetteurs

| Émetteur | Entité légale / juridiction | Véhicule | Droits du porteur | Chaîne(s), AUM [lu-WF] 2026-09-20 | TSV-eligible (confronté au texte SEC 34-106402, prospectif — aucun TSV agréé n'opère encore) |
|---|---|---|---|---|---|
| xStocks | Backed Assets (JE) Limited, Jersey (JFSC, consentements COBO/CGPO) | Instrument de dette au porteur, « tracker certificate » (droit suisse ; base prospectus FMA Liechtenstein pour l'UE/EEE) | Exposition économique 1:1 collatéralisée ; aucun vote ; rachat selon Final Terms | SOL $390,2M / ETH $160,1M / Ink $10,2M (+7 chaînes mineures) ; plateforme $579,9M | Formulation proche de l'exclusion SEC pour « synthetic exposure » (dette suivant un sous-jacent) ; vote absent |
| Ondo Global Markets | Ondo Global Markets (BVI) Limited, îles Vierges britanniques, SPV distinct d'Ondo Finance Inc. | Structured note, retour total | Rachat + sûreté de premier rang sur les actifs de couverture ; **pas** de droit de vote ni d'information actionnaire (texte propre, cité) | ETH+BNB+SOL déclarés ; répartition par chaîne **non fiable cette passe** (page plateforme RWA.xyz probablement mélangée avec les Treasuries Ondo — voir archive §A.4) | Catégorie générique « structured note / linked security » proche de l'exclusion SEC ; vote absent |
| Superstate Opening Bell | Superstate = transfer agent enregistré SEC, **pas l'émetteur** ; l'émetteur reste la société tokenisée elle-même (ex. Galaxy Digital Inc. pour GLXY, Forward Industries pour FWDI) | Tokenisation par/pour le compte de l'émetteur d'actions existantes — catégorie (1) de la définition SEC | « Mêmes droits économiques et de gouvernance » affirmé par l'émetteur/la plateforme ; énumération précise (dividende/vote/liquidation) non retrouvée mot pour mot dans les pages lues | Solana + Ethereum ; $36,6M, 3 actifs « RWA » sur 25 actifs au total | Correspond le mieux à la catégorie (1) de la définition SEC ; le constat des mêmes droits (condition E, texte primaire) est une obligation du TSV lui-même — inobservable, aucun TSV agréé aujourd'hui |
| Backpack Securities + Sunrise | Backpack Securities Global Limited (Nouvelle-Zélande), courtier introducteur ; compensation RQD Clearing LLC + Atomic Vault Securities LLC (toutes deux SEC-registered, FINRA/SIPC) | « Security entitlement » sous UCC Article 8 (New York) — le document propre exclut explicitement CFD/dérivé/wrapper/SPV | Adossement réel 1:1 + protection de faillite + éligibilité ACATS/DTCC actives **aujourd'hui** ; dividende, vote et actions de capital **« supported but not yet enabled »** (texte propre, lu ce jour) | Solana (venue de négociation : Sunrise) ; $31,6M (Asortino) | Structure la plus proche d'une détention réelle documentée, mais droits incomplets à la date de cette lecture (vote/dividende non actifs) — condition E non remplie intégralement aujourd'hui d'après le document même |
| PreStocks | Entité non divulguée sur la page produit ; SPV par société cible, non nommés individuellement | Tokens de suivi de valorisation d'entreprises privées pré-IPO | Explicitement : « no ownership, voting, dividend, information, or other legal rights » ; « not affiliated with, endorsed by, or issued by referenced companies » | Solana | Hors sujet : pas de NMS stock sous-jacent (sociétés privées non cotées) ; formulation quasi identique à l'exclusion SEC pour exposition synthétique |

**Dinari, Robinhood, bStocks : absents de Solana.** Pour Dinari, confirmé au niveau document primaire (`docs.dinari.com/docs/blockchain`, Solana absente de la liste des chaînes supportées, aucune mention « à venir ») ; une source secondaire affirmant le contraire n'est pas corroborée par ce document.

## Table autres chaînes — émetteurs

| Émetteur | Entité légale | Chaîne principale | Véhicule | RWA.xyz [lu-WF] / Asortino [lu-WF], 2026-09-20 |
|---|---|---|---|---|
| Ondo Global Markets | Ondo Global Markets (BVI) Limited | ETH, BNB, SOL | Structured note | $853,2M (395 actifs) / $1,15 Md |
| bStocks (Binance) | BTECH Holdings Ltd, Abu Dhabi Global Market (FSRA, prospectus admis 11/06/2026) | BNB Smart Chain | « Certificate over Shares » — le texte propre exclut explicitement la détention directe d'une action | $751,8M (77 actifs) / $796,25M (Asortino nomme l'émetteur « Binance ») |
| xStocks / Backed | Backed Assets (JE) Limited | SOL + ETH + 8 autres chaînes | Tracker certificate | $557,2M (839 actifs) / Backed Finance $874,6M |
| Securitize | Securitize Markets LLC (courtier + ATS, SEC-registered) + Securitize Transfer Agent LLC | SECZ : Avalanche+Solana ; EXOD : Algorand — **deux déploiements distincts**, pas une seule chaîne homogène | SECZ = action de Securitize elle-même, tokenisation « issuer-sponsored » | $357,5M (3 actifs) |
| Robinhood | Robinhood Assets (Jersey) Limited, immatriculation Jersey | Robinhood Chain | Dette tokenisée ; texte propre cité : « does not grant investors any legal or beneficial rights » | $152,9M (188 actifs) / $172,1M |
| Reality | Entité légale **non identifiée** ; adossement déclaré via Alpaca Securities LLC | Arbitrum One (ERC-20) | rToken adossé 1:1, attestation quotidienne par un cabinet tiers (affirmé, non lu en primaire) | $151,8M (2 160 actifs) / $163,1M — écart avec d'autres comptages (1 700+, 69), voir archive §B.9 |
| Figure | Figure Technology Solutions, Inc. | Provenance (ATS propre « OPEN ») | Décrite comme action « native » sur blockchain ; statut de NMS stock **non établi** par les sources lues | $83,7M (1 actif, FGRS) |
| WisdomTree | WisdomTree — fonds ouverts enregistrés sous l'Investment Company Act de 1940, SEC-registered | EVM (+ interopérabilité Stellar) | Part de fonds réglementé, catégorie distincte d'un tracker/d'une note | $28,0M (6 actifs, répartition fonds/actions non détaillée) |
| Dinari | Dinari Securities LLC (courtier FINRA), garde chez Alpaca Securities LLC | Ethereum, Arbitrum, Avalanche, Base, HyperEVM, HyperCore, Plume — **pas** Solana | Détention en nom du courtier (« street name »), rachat direct | $12,7M (692 actifs) / $21,6M |
| ST0x | S01 Issuer GmbH — juridiction précise **non confirmée en primaire** (qualifiée « allemande » par une seule source secondaire, en tension avec la supervision FMA Liechtenstein) | Base, Ethereum | Droit d'échange contractuel 1:1, base prospectus approuvé par la FMA Liechtenstein | apport : $1,7M, 57 actifs (non remesuré cette passe) |
| STOKR | Plateforme = VASP Luxembourg (CSSF) ; l'exemple lu (Capital B) est émis par un compartiment de titrisation luxembourgeois | Liquid Network (sidechain Bitcoin) | Structured notes 1:1 ou 1:100 ; l'exemple trouvé porte sur une action **européenne**, pas un NMS stock US | apport : $6M (ancienne table) |
| Backed Finance (legacy bTokens) | **Même émetteur que xStocks** — Backed Assets (JE) Limited ; confirmé, pas une entité séparée | ETH surtout | Bearer debt / tracker certificate ; produit en fin de vie (fin 2026), conversion 1:1 vers xStocks disponible | apport : $6,6M (table du 13 juillet) |
| Centrifuge | Se positionne comme transfer agent SEC-registered (source secondaire) | ETH+ | Décrite comme « native », pas wrapper/dérivé (affirmé, non lu en primaire) | apport : $6,5M ; hors Top 10 RWA.xyz d'aujourd'hui (montant trop faible, cohérent) |

**Coinbase B20** : Coinbase EST l'émetteur (« Coinbase as the asset issuer », `docs.chain.link`, lu en primaire) ; Chainlink fournit le flux de prix (valeur de retour total = prix de marché × multiplicateur) et n'est pas lui-même un émetteur.

## AUM par chaîne — deux méthodologies, jamais additionnées

| Chaîne | RWA.xyz (agrégat par plateforme) | Asortino (11 émetteurs déclarés, 19 chaînes) |
|---|---|---|
| BNB Chain | inclus dans bStocks $751,8M | $1,11 Md (34,5 %) |
| Ethereum | dispersé par plateforme | $814,4M (25,2 %) |
| Solana | dispersé par plateforme (xStocks seul : $390,2M) | $723,2M (22,4 %) |
| Arbitrum One | dispersé par plateforme | $176,3M (5,5 %) |
| Robinhood Chain | inclus dans Robinhood $152,9M | $172,1M (5,3 %) |
| X Layer | absent du Top 10 plateformes lu | $162,8M (5,0 %) |

**Pourquoi ne pas additionner** : les deux tables recouvrent des émetteurs communs (Ondo, Backed/xStocks, Robinhood, Dinari, Reality, Backpack) pour des montants proches mais non identiques — leurs méthodes de calcul ne sont pas documentées en détail par l'une ou l'autre page, et additionner reviendrait à compter deux fois le même actif sous-jacent. RWA.xyz compte par plateforme et par actif individuel (longue traîne, ex. Reality à 2 160 lignes) ; Asortino resserre sur 11 émetteurs mais distingue « déploiements actifs » (20 586) de « produits-token » (4 849, ratio ≈ 4,2 chaînes/produit). Détail : archive §A.6.

## Tuyaux explicitement exclus (émetteur ≠ venue)
Kraken, Bybit, Gate, Pionex, Jupiter, Raydium, Kamino, Meteora, Sunrise (venue Solana de Backpack Securities), Binance Spot (venue de bStocks). Le ticker n'est pas la source.

## Écarts vs census v3 (`docs/CENSUS-ACTIONS-TOKENISEES-v3-2026-09-19.md`)

**Correction établie par lecture directe du CSV `census-v3.csv`** (`Grep`, pas seulement le texte de synthèse) : Backpack (33), st0x (16), PreStocks (6) et Reality (4) sont **présents** dans v3 avec des comptes non nuls (18 occurrences mesurées). **Seul Superstate Opening Bell est réellement absent** de v3 (0 occurrence dans le CSV brut). Asortino est absent de v3 comme source méthodologique — v3 mesure la liquidité de pool DEX (adresse de contrat + volume 24h), pas l'AUM déclaré par un émetteur — pas comme émetteur omis. v3 porte en outre un émetteur **Tessera** (2, pré-IPO, exclu de Bell par décision investisseur 40) absent à la fois de l'apport et de la liste d'émetteurs à couvrir donnée pour cette mission. v3 (370 lignes / 330 actifs stricts, couvrabilité DEX) et ce census (AUM déclaré par émetteur) répondent à deux questions différentes, non comparables terme à terme.

**Univers Bell actuel (fait, pas une recommandation)** : `CHANTIERS.md` déclare l'univers de la course fondatrice = 4 mints xStocks sur Solana (TSLAx, SPYx, NVDAx, AAPLx). Adresses de mints Solana publiées par un émetteur, pour ces 4 tokens ou pour Superstate Opening Bell : **NON TROUVÉES** cette passe (`docs.xstocks.fi` au niveau adresse et `superstate.com/assets/*` non ouverts au niveau de preuve exigé — une tentative sur `superstate.com/assets/glxy` a échoué techniquement). Question ouverte pour l'orchestrateur et l'advisor-marché : faut-il rouvrir ces pages avec un budget dédié.

## Ce que ce census n'établit pas
- Aucun verdict définitif « TSV-eligible = oui/non » : le constat des mêmes droits (condition E, texte SEC 34-106402) est une obligation portée par le TSV lui-même ; aucun TSV agréé n'opère à ce jour (lancement annoncé mi/fin octobre 2026, source secondaire citée par l'ADR-B0). La colonne ci-dessus juxtapose le texte réglementaire et le texte propre de chaque émetteur, sans trancher au-delà de cette juxtaposition.
- Aucune addition des deux tables d'AUM (double compte du même actif sous-jacent).
- Aucun montant issu d'une seule source secondaire n'est présenté comme un fait établi.
- La liste complète des mints Solana par émetteur (au-delà des 4 déjà utilisés par Bell) n'a pas pu être établie au niveau de preuve exigé (document d'émetteur, pas un agrégateur seul).

## Procurements formés (détail complet, tentatives et URL : archive de vérification)
Entité légale de Reality ; prospectus primaire ST0x (juridiction du GmbH) ; entité légale de la plateforme STOKR elle-même ; dépôt réglementaire SEC formel pour un exemple Opening Bell ; déclarations primaires d'Anthropic et d'OpenAI (mai 2026, transferts SPV) ; adresses de contrat xStocks/Superstate lues dans un document d'émetteur ; document « Tokenized Securities Issuer Terms of Service » de Backpack (nommé par une source tierce, non localisé dans le centre légal officiel) ; méthodologie complète RWA.xyz (Platform vs Issuer) ; liste complète des 11 émetteurs Asortino (7 seulement obtenus) ; documentation Securitize sur les droits précis de SECZ ; documentation Centrifuge sur ses actifs actions.

## Source
Archive de vérification complète (identification, citations courtes, journal des URL, contradictions, niveau par cellule) : `F:\PRODUITS\etude-2026-09-20\census-investisseur\VERIFICATION-census-emetteurs-2026-09-20.md`. Apport investisseur d'origine : `F:\PRODUITS\etude-2026-09-20\census-investisseur\APPORT-INVESTISSEUR-census-emetteurs-2026-09-20.md`.
