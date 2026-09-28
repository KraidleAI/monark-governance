# FAITS — sources du texte public « why SHŌGEN? » (2026-09-28, 20:1x-20:3x UTC)

Lecteur : orchestrateur `claude-fable-5-1`. Chrome (Claude in Chrome) injoignable (« not connected », deux essais 20:1x UTC) : lecture sur place par le navigateur INTERNE (règle 2026-09-20 : interne d abord). Niveaux : [lu] page primaire lue en entier dans le navigateur ; [lu-extrait] extrait Firecrawl ; [détenu] artefact de la bibliothèque Shōgen déjà lu par une passe antérieure (`F:/Shogen/biblio/INDEX.md`, cité par `docs/02-vision.md` et `04-certificat-diversite.md`) ; [2nd] presse.

## A. Manipulation d oracle — CFTC, communiqué 8647-23 (9 janvier 2023) [lu] https://www.cftc.gov/PressRoom/PressReleases/8647-23
- « First CFTC Oracle Manipulation Case on “Decentralized Exchange” ».
- Mécanique : le prix « was based upon the relative price of MNGO … and USDC » ; l auteur « artificially pumped up the price of MNGO by rapidly purchasing substantial quantities of MNGO on **three digital asset exchanges that were the inputs for the “oracle,” or data feed** ».
- Effet : « the price of MNGO as reported by the oracle, jumped over 13-fold during a 30-minute span » ; retrait de « over $110 million in digital assets » ; ~67 M$ rendus, ~47 M$ retenus.
- Lecture Shōgen : trois sources d entrée qui bougent ensemble sous une même main ne font pas un quorum ; l indépendance des sources était un postulat, pas une mesure.

## B. Concentration d hébergement des nœuds Ethereum — ethernodes.org/network-types [lu] (page datée « © bitfly explorer gmbh 2025 », valeurs du jour 2026-09-28 20:2x UTC ; attribution requise par le site)
- Couche d exécution : 8 196 nœuds ; Hosting 3 532 (43,09 %), Residential 4 402 (53,71 %), Mobile 2,14 %, Proxy 1,06 %.
- Couche de consensus : 5 710 nœuds ; **Hosting 3 042 (53,27 %)**, Residential 2 544 (44,55 %).
- Lecture Shōgen : la « décentralisation » des sources a un axe d infrastructure mesurable (hébergé vs résidentiel) ; c est un axe que le certificat de diversité mesure (04 §1), les axes juridiction/opérateur ne sont que déclarés. Chiffres du jour : information, jamais réutilisés comme constante.

## C. Panne d un fournisseur RPC dominant, 11 novembre 2020 [2nd] (The Block, 2020-11-11, extrait Firecrawl ; page primaire refusée par le navigateur ; billet post-mortem du fournisseur : TLS cassé, non lu)
- « The outage has also caused crypto exchanges, including Binance and Bithumb, to disable ETH and ERC-20 tokens withdrawals » ; portefeuille grand public en échec.
- Lecture Shōgen : un seul point de lecture partagé par des acteurs « indépendants » = un seul point de défaillance ; la dépendance amont est un axe de diversité (04 §1). Non cité en chiffres dans le tweet (niveau [2nd]) ; nommé sans fournisseur (règle des textes publics : aucun nom de vendeur).

## D. Commerce agentique — Visa Intelligent Commerce [lu] https://www.visa.com/en-us/solutions/intelligent-commerce (2026-09-28 20:2x UTC)
- « companies face growing challenges to securely authorize payments, manage risk and maintain trust when transactions are initiated by AI » ; « embedding payment credentials, controls, authentication and protections into automated buying » ; « Trusted Agent Protocol … secure agent verification, trust signaling ».
- Lecture Shōgen : la couche paiement sécurise QUI paie et COMBIEN ; personne n atteste ce que l agent A LU avant de décider. C est le trou que Shōgen adresse (perception attestée), en amont du permis de dépense (Kraidle, autorité bornée). Aucun nom de vendeur dans le tweet.

## E. Presse du jour [2nd] : x402 (protocole de paiement HTTP 402 pour agents), chiffres d adoption (eco.com 2026 : « 69,000 active agents, 165 million transactions » à fin avril 2026) — NON repris dans le tweet (seconde main).

## F. Fondements détenus (bibliothèque Shōgen, [détenu], cités par `F:/Shogen/docs/02-vision.md` et `04-certificat-diversite.md`)
- Knight & Leveson 1986 : 27 versions, un million de tests, K = 1 255 co-défaillances, « we reject the null hypothesis with a confidence level of 99% » ; §4 : l axe organisé (deux universités) n a rien protégé — « all were found to involve versions from both schools ».
- Avizienis : l indépendance des versions = « the fundamental conjecture of the NVP approach ».
- DECO (CCS 20) : prouve « that a piece of data accessed via TLS came from a particular website » — provenance, pas vérité ; TLSNotary FAQ : « does not solve the "Oracle Problem" » ; C2PA 2.4 §1.2 : « SHOULD NOT provide value judgments ».
- Chainlink OCR, Lemme 8 (détenu côté Kraidle) : la médiane « is either the observation of a correct oracle or lies between the observations of two correct oracles » — confinement, pas exactitude. (Nom de vendeur : non cité dans le tweet.)
- Phrase fondatrice Shōgen (README, 02) : « Une attestation prouve ce que la source a dit — jamais que la source dit vrai. »

## G. Ce qui est servi aujourd hui (honnêteté publique, `apps/site/lib/shogen-copy.ts`, épinglé par test)
« What is built and served is the attest tool: one committed witness, its bytes, its hash and its named residual hypotheses. The full Shōgen sensor, which produces continuous testimonies across sources, is under test and is not served yet. » Le tweet le dit.
