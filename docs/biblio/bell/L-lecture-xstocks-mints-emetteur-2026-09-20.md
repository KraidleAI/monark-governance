# Lecture — xStocks : confirmation émetteur des 4 adresses de mint Solana vs `pools.ts`

## Identification
- **Mission (PLAN)** : confirmer les adresses de mint xStocks (TSLAx, SPYx, NVDAx, AAPLx) dans un **document
  d'émetteur** (règle projet : « le ticker n'est pas la source », « jamais un agrégateur seul »).
- **Agent** : lecteur/chercheur Sonnet 5, MONARK/Bell.
- **Modèle résolu** : `claude-sonnet-5` (déclaré en tête du rapport final à l'orchestrateur — Gate 0).
- **Horodatage** : horloge UTC lue via `date -u` avant chaque section de lecture externe (jamais estimée) —
  fenêtre de lecture externe : 2026-09-20T18:17:32Z → 2026-09-20T18:32:01Z.
- **Fichier projet lu** : `F:\Monark\apps\bell\src\pools.ts` — lu intégralement (124 lignes), P1 (dépôt de code
  du projet lui-même).
- **Sources émetteur visées** (constatées ouvertes par l'orchestrateur le 2026-09-20, non lues avant cette
  passe) : `https://docs.xstocks.fi`, `https://defi.xstocks.fi`, `https://assets.backed.fi/legal-documentation`,
  `https://xstocks.fi/documents/xstocks-terms-of-service.pdf` (URL seule, PDF **non ouvert**, conforme à la
  consigne « aucun téléchargement de PDF »).
- **Source additionnelle découverte pendant la lecture** (P1, non listée dans la mission initiale, atteinte
  depuis un lien officiel de `docs.xstocks.fi`) : `https://api.xstocks.fi/api/v2` — l'API publique en
  production de l'émetteur, dont la base URL est déclarée verbatim sur `docs.xstocks.fi/apis/openapi`, et dont
  le schéma OpenAPI est téléchargeable en JSON à `https://docs.xstocks.fi/_bundle/apis/@v2/openapi.json`.

## Méthode et outils
- `WebFetch` pour un premier passage (résumé assisté par modèle) ; ré-vérification systématique par `curl`
  (Bash) sur le **même domaine émetteur** pour toute valeur (adresse, ISIN, endpoint, citation) — marquée
  « vérifié curl » ci-dessous. **Toutes les valeurs numériques/adresses retenues dans ce document sont
  vérifiées curl**, pas seulement résumées par WebFetch.
- Aucun téléchargement de PDF : URL consignée seulement (aucun des `.pdf` rencontrés n'a été ouvert).
- Aucun compte/login/CAPTCHA rencontré. Aucun outil n'a refusé un domaine pendant cette passe.
- Aucun appel à l'outil advisor intégré (règle de mission explicite + règle mainteneur 2026-09-05 — filtre de
  régurgitation ; ce rapport contient de nombreux extraits bruts de HTML/JSON dans les résultats d'outils, ce
  qui est précisément le profil de transcript qui déclenche le blocage : aucune consultation formée n'est
  apparue nécessaire, donc aucune n'est jointe).
- Niveaux : **[lu]** texte/JSON brut réellement ouvert et vérifié par `curl` ; **[abs]** résumé WebFetch non
  re-vérifié brut (aucun ne subsiste comme preuve terminale dans ce document — chaque [abs] initial a été
  re-vérifié [lu] ci-dessous, sauf mention contraire explicite) ; **[2nd]** mention secondaire.
- Classes : P1 = émetteur (`docs.xstocks.fi`, `api.xstocks.fi`, `defi.xstocks.fi`, `assets.backed.fi`,
  `xstocks.fi/documents`) ; agrégateur (Jupiter) = **jamais suffisant seul** par règle projet, cité ici
  uniquement pour comparaison avec ce que déclare déjà `pools.ts`.

---

## 0. Ce que déclare `pools.ts` AVANT toute recherche externe (fichier:ligne)

Modèle de provenance déclaré en tête de fichier (`pools.ts:3-7`) : chaque adresse est (a) sourcée depuis « a
NAMED public API (url + fetch date + sha256 of the exact response body) — an AUDIT snapshot » et (b)
« CONFIRMED FIRST-HAND ON-CHAIN by a reproducible call whose result does not drift (getAccountInfo owner /
eth_call symbol+decimals) ». Citation exacte (`pools.ts:7`) : « The on-chain check is the load-bearing [lu,
first-hand]; the API snapshot is provenance/audit. »

Commentaire du bloc XSTOCKS (`pools.ts:74-75`), citation : « xStocks (Backed Finance) on Solana — Token-2022, 8
decimals. All 4 confirmed on-chain: getAccountInfo owner == Token-2022 program, decimals == 8 (impostor
`...pump` / miscased tickers excluded by the check). »

**Vérification du rappel de l'avis advisor-marché** (« API Jupiter + contrôle on-chain owner Token-2022/décimales »)
contre le fichier réel : **confirmé exactement**. L'API déclarée est `lite-api.jup.ag/tokens/v2/search`
(constante `JUP`, `pools.ts:71`) et le contrôle on-chain déclaré est `getAccountInfo.owner==Token-2022,
decimals=8` pour chacune des 4 entrées (`pools.ts:78,80,82,84`). **Aucun document d'émetteur n'est cité comme
source dans `pools.ts`** — c'est exactement le manque que cette lecture devait combler (voir §1 : comblé).

| Ticker | Adresse mint (pools.ts) | Decimals | Standard déclaré | API déclarée (`Provenance.api`) | fetchedAt | snapshotSha256 | Contrôle on-chain déclaré | Ligne |
|---|---|---|---|---|---|---|---|---|
| TSLAx | `XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB` | 8 | token-2022 | `https://lite-api.jup.ag/tokens/v2/search?query=TSLAx` | 2026-09-19 | `8b5cda01719c` | `getAccountInfo.owner==Token-2022, decimals=8` | 77-78 |
| SPYx | `XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W` | 8 | token-2022 | `https://lite-api.jup.ag/tokens/v2/search?query=xStock` (requête générique « xStock », pas « SPYx ») | 2026-09-19 | `6affa4e6efaa` | `getAccountInfo.owner==Token-2022, decimals=8` | 79-80 |
| NVDAx | `Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh` | 8 | token-2022 | `https://lite-api.jup.ag/tokens/v2/search?query=NVDAx` | 2026-09-19 | `c6bd6df7aebe` | `getAccountInfo.owner==Token-2022, decimals=8` | 81-82 |
| AAPLx | `XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp` | 8 | token-2022 | `https://lite-api.jup.ag/tokens/v2/search?query=AAPLx` | 2026-09-19 | `cb54a56dc928` | `getAccountInfo.owner==Token-2022, decimals=8` | 83-84 |

Contexte connexe lu dans le même fichier (pour ne pas le reporter à tort comme émetteur) : le bloc `ONDO`
(`pools.ts:87-94`) est un émetteur *différent* (Ondo Global Markets / Ethereum) — hors périmètre de cette
mission, non traité ici.

---

## 1. TABLE DE CONFIRMATION — `pools.ts` vs émetteur (`api.xstocks.fi`, live, [lu] vérifié curl)

**Endpoint utilisé** : `GET https://api.xstocks.fi/api/v2/public/assets/{symbol}` — public, `"security": []`
dans le schéma OpenAPI (aucune clé). Appelé en direct pour les 4 tickers le 2026-09-20 entre 18:26Z et 18:27Z
(UTC, `date -u`). Réponses sauvegardées, HTTP 200 pour les 4 (tailles 5,4-6,3 Ko).

**Comparaison mécanique caractère-pour-caractère** (script bash, pas une relecture visuelle) entre la chaîne
`pools.ts` et la chaîne extraite de la réponse live (déploiement `"network":"Solana"`) :

| Ticker | Adresse `pools.ts` | Adresse émetteur (live API, `deployments[].address` où `network=="Solana"`) | Égalité caractère/caractère | Longueur |
|---|---|---|---|---|
| TSLAx | `XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB` | `XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB` | **OUI — EXACT_MATCH** | 43 = 43 |
| SPYx | `XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W` | `XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W` | **OUI — EXACT_MATCH** | 43 = 43 |
| NVDAx | `Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh` | `Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh` | **OUI — EXACT_MATCH** | 43 = 43 |
| AAPLx | `XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp` | `XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp` | **OUI — EXACT_MATCH** | 43 = 43 |

**Les 4 adresses de `pools.ts` sont confirmées caractère pour caractère par l'API publique de l'émetteur.**

### Programme de token annoncé (Token-2022 ?)
- **Prose émetteur** (`docs.xstocks.fi/developers`, [lu] vérifié curl) — citation exacte (14 mots) : « On
  Solana, tokens use the SPL Token-2022 standard with the Scaled UI extension. » Cette phrase est générique
  (« tokens » au pluriel, pas par-ticker) mais s'applique aux 4 xStocks Solana traités ici.
- **Nuance importante (précision, pas une contradiction)** : le schéma JSON de l'objet `deployments[]` pour le
  déploiement `network:"Solana"` de chacun des 4 tickers **ne porte pas** de champ structuré
  `solanaTokenProgram` au niveau du token xStock lui-même — ce champ (`enum: ["TokenProgram",
  "Token2022Program"]`) n'existe, dans le schéma lu, que **sous `stablecoins[]`** (ex. USDC sur Solana y est
  déclaré `"solanaTokenProgram":"TokenProgram"`, c'est-à-dire le programme SPL Token **classique**, pas
  Token-2022 — cohérent avec la réalité connue d'USDC). Donc l'affirmation « Token-2022 » pour TSLAx/SPYx/
  NVDAx/AAPLx repose ici sur la **prose** de `docs.xstocks.fi/developers`, pas sur un champ structuré de
  `/public/assets/{symbol}` par token. Le contrôle on-chain propre de `pools.ts` (`getAccountInfo.owner`)
  reste, par la méthodologie même du fichier, le [lu, first-hand] porteur pour ce fait précis.

### Décimales
- **NON TROUVÉ** dans les sources émetteur lues : ni `docs.xstocks.fi` (les 4 pages doc + developers + apis
  openapi) ni le schéma `/public/assets` (objet `deployments[]`) ne publient de champ `decimals` pour le token
  xStock lui-même (un champ `decimals` existe bien, mais uniquement à l'intérieur de `stablecoins[]`, ex. USDC
  `decimals:6` — pas pour TSLAx/SPYx/NVDAx/AAPLx). La valeur `8` de `pools.ts` n'est donc, à ce stade,
  corroborée par aucun document ou endpoint émetteur lu dans cette passe ; elle reste portée uniquement par le
  contrôle on-chain propre de `pools.ts`. Pas de demande de procurement ici (une donnée on-chain existe déjà et
  est reproductible) — signalé comme un écart de publication de l'émetteur, pas un défaut de `pools.ts`.

---

## 2. Identité de l'émetteur, nature du produit, ISIN par produit

### Identité et juridiction — CONFIRMÉ [lu], vérifié curl
Source : `https://docs.xstocks.fi/docs/product-legal-overview` (curl 2026-09-20, HTTP 200, 348 233 octets ;
citations extraites par grep sur le HTML brut, pas par résumé WebFetch).

Citation exacte (22 mots) : « xStocks are structured financial instruments issued by Backed Assets (JE)
Limited, a Jersey company registered with the Jersey Financial Services Commission (JFSC). »

Citation exacte, bloc FAQ de la même page (22 mots) : « xStocks are issued by Backed Assets (JE) Limited, a
Jersey-based special purpose vehicle dedicated solely to the issuance and redemption of xStocks. »

**→ Confirme exactement l'identité attendue par la mission : « Backed Assets (JE) Ltd ».**

### Nature du produit — CONFIRMÉ [lu], vérifié curl
Citation exacte (12 mots) : « Each xStock is a bearer debt instrument classified as a tracker certificate. »
(bloc FAQ « Who issues xStocks and are they regulated? »)

Citation complémentaire (16 mots, fragment tronqué par ma fenêtre d'extraction — pas par la source) : « Each
xStock is a tracker certificate, fully collateralized 1:1 by the underlying equity held with regulated… »

**→ Confirme le terme attendu par la mission : « tracker certificate ».**

### ISIN par produit — TROUVÉ, mais pas où attendu : sur l'API live, pas sur les pages `docs.xstocks.fi`
Recherche « ISIN » sur les 7 pages `docs.xstocks.fi` téléchargées (`/docs`, `/docs/how-xstocks-work`,
`/docs/product-legal-overview`, `/docs/dividends-and-stock-splits`, `/docs/issuance-and-redemption`,
`/developers`, `/apis/openapi`) : **0 occurrence** sur les 7. Les ISIN ne sont pas publiés en prose sur ces
pages.

En revanche, le schéma OpenAPI de `/public/assets` (P1, `docs.xstocks.fi/_bundle/apis/@v2/openapi.json`,
212 354 octets, `application/json`, curl 2026-09-20) déclare deux champs ISIN par actif — `isin` (le xStock /
tracker certificate lui-même) et `underlying.isin` (le titre sous-jacent réel). Les 4 réponses live
`GET /public/assets/{symbol}` (HTTP 200, appelées 2026-09-20 ~18:26-18:27Z) donnent, [lu] vérifié curl :

| Ticker | Nom (émetteur) | ISIN du xStock (token) | ISIN du sous-jacent | Ticker sous-jacent | Bourse (`exchange.abbreviation`/`mic`) |
|---|---|---|---|---|---|
| TSLAx | Tesla xStock | `CH1436219252` | `US88160R1014` | TSLA | NASDAQ / XNAS |
| SPYx | SP500 xStock | `CH1436219716` | `US78462F1030` | SPY | NYSE Arca / ARCX |
| NVDAx | NVIDIA xStock | `CH1436219195` | `US67066G1040` | NVDA | NASDAQ / XNAS |
| AAPLx | Apple xStock | `CH1436219187` | `US0378331005` | AAPL | NASDAQ / XNAS |

Note factuelle (pas une contradiction établie) : l'ISIN du **token** porte un préfixe **CH** (Suisse) alors que
l'émetteur déclaré est une société **de Jersey** — observation neutre consignée, aucune explication publiée
lue dans cette passe (le préfixe ISIN reflète l'agence de numérotation, pas nécessairement le domicile de
l'émetteur ; ceci n'est **pas** vérifié dans cette passe, donc non affirmé).

### Sur l'identité de l'entité « Backed » — divergence chronologique observée sur `assets.backed.fi/legal-documentation`
Cette page (curl 2026-09-20, HTTP 200, 41 429 octets), méta-description [lu] : « Access prospectus, Final
Terms, KIDs, and legal documentation for all products » — est le registre réglementaire (régime UE Prospectus
Regulation) de l'ensemble des produits « Backed », pas une page xStocks-spécifique.

Liste des PDF référencés (URL seules, **non ouverts**), avec le nom d'entité tel qu'il apparaît **dans le nom
de fichier** (aucune lecture du contenu du PDF) :
- 2022-05-09 à 2023-05-09 : « **Backed Tokens GmbH** » puis « **Backed Assets GmbH** »
- 2024-03-01 à 2026-01-30 : « **Backed Assets** » (sans suffixe d'entité dans le nom de fichier)
- **2026-07-28** : `…20260728 Backed Assets (JE) Limited First Supplement.pdf` — première occurrence
  explicite de « (JE) Limited » dans un nom de fichier de ce registre.
- Pied de page du site (curl, [lu]) : « 2024 © Backed Assets (JE) Limited. All rights reserved. » et « Backed
  Assets (JE) Limited undertakes no obligation to publicly update or revise any information… »

**Lecture prudente** : la séquence des noms de fichiers suggère un changement de dénomination de l'entité
éditrice (GmbH → « Backed Assets » → « Backed Assets (JE) Limited ») entre 2022 et 2026, cohérent avec
l'identité courante donnée par `docs.xstocks.fi`. **Le mécanisme de ce changement (redomiciliation, filiale,
reprise de programme…) n'est établi par aucun document lu ici — NON TROUVÉ**, consigné comme tel plutôt que
déduit. Autre détail mineur observé sans suite donnée : le tableau de la page affiche la date du Base
Prospectus courant comme « 2026/05/08 » alors que le nom du fichier PDF correspondant porte « 20260727 » —
divergence interne à la page de l'émetteur, signalée, non résolue.

---

## 3. Mécanisme « scaled UI amount / multiplier » pour dividendes et splits

Source : `https://docs.xstocks.fi/docs/dividends-and-stock-splits` (curl 2026-09-20, HTTP 200, 332 261 octets ;
citations vérifiées sur le HTML brut).

Citation exacte (13 mots) : « xStocks handle corporate events through an onchain rebasing mechanism called the
multiplier. »

Mécanique décrite (paraphrase courte + citations) :
- « Every xStock launches with a multiplier of 1.0 » — au lancement, multiplicateur = 1.0.
- Dividende — citation exacte (13 mots) : « Example: Apple pays a dividend. The multiplier moves from 1.0 to
  1.008. » Table associée (avant/après) : Multiplier 1.0→1.008, Scaled Balance 1.0→1.008, Equity Value
  1.0 AAPL→1.008 AAPL.
- Split — citation exacte (12 mots) : « Example: A 4-for-1 split. The multiplier moves from 1.008 to 4.032. »
- Split inverse — citation exacte (13 mots) : « Example: A 2-for-1 reverse split. The multiplier moves from
  4.032 to 2.016. »
- Publication on-chain — citation exacte (12 mots) : « The multiplier is published onchain before each
  corporate event takes effect. »

**Implémentation par chaîne — passage directement utile à Bell (-b3a/-b3c)**, citation exacte et complète (24
mots) : « Solana: The onchain balance remains constant. A multiplier is stored in token metadata. Wallets and
applications apply the multiplier to calculate the displayed balance. »

En comparaison, pour les chaînes EVM (citation partielle, fragment tronqué par ma fenêtre d'extraction) : « EVM
chains (Ethereum and compatible networks): The smart contract adjusts balances automatically. The standard
bala[nceOf function…] » — c'est-à-dire un mécanisme **différent** par construction : sur EVM le solde
« affiché » = solde on-chain (ajusté par le contrat) ; sur Solana le solde brut on-chain **ne change pas**, et
c'est le multiplicateur (stocké en métadonnées) qui doit être appliqué côté client/lecteur pour obtenir la
valeur affichée. Ceci est cohérent avec — et corrobore — la mention « SPL Token-2022 standard with the Scaled
UI extension » lue en §1 sur `docs.xstocks.fi/developers`.

**Ce que cette page ne dit PAS explicitement** : elle ne nomme pas ici littéralement « Token-2022 » ni « Scaled
UI Amount extension » (ces termes techniques précis apparaissent sur la page `/developers`, pas sur cette page
`/docs/dividends-and-stock-splits` — vérifié par grep ciblé, 0 occurrence de « Token-2022 » sur cette page).

---

## 4. Page Proof of Reserves — description (aucune valeur de prix/NAV recopiée)

**Limite de méthode consignée** : la mission cite `https://defi.xstocks.fi` (onglets Products / Smart
Contracts / Proof of Reserves / Oracles) comme source. Ce site est une **SPA 100 % rendue côté client** (Vite ;
`curl` ne récupère qu'une coquille HTML de 522 octets pointant vers un bundle JS ; `WebFetch` ne rend pas le
JS — confirmé : la sortie WebFetch sur cette URL indique explicitement ne rien pouvoir extraire). **Aucun
contenu de `defi.xstocks.fi` n'a donc pu être lu comme texte/JSON brut.** Ce n'est pas un refus d'outil ni de
domaine : c'est une limite technique (rendu client obligatoire) consignée ici plutôt que contournée par un
outil non prévu (pas de rendu JS disponible dans cette mission). `docs.xstocks.fi` (page racine, [lu]) confirme
que ce portail EST bien le bon, citation exacte : « DeFi Portal & Proof of Reserves:
https://defi.xstocks.fi ».

**Solution de repli utilisée** : le schéma OpenAPI émetteur (`docs.xstocks.fi/_bundle/apis/@v2/openapi.json`,
[lu] vérifié curl) documente les endpoints Proof of Reserves servant vraisemblablement ce même portail (lien
non formellement confirmé — les deux sont des propriétés `xstocks.fi`/`docs.xstocks.fi` de l'émetteur, mais
aucun document lu n'affirme explicitement que `defi.xstocks.fi` consomme `api.xstocks.fi` — **non établi**,
juste plausible).

### Champs publiés (description de schéma seule, aucun appel live effectué sur cet endpoint — aucune valeur
recopiée)
`GET /public/proof-of-reserves/{symbol}` (public, `"security": []`), description déclarée : « Get proof of
reserves for a specific asset. » Champs de la réponse :
- `symbol` — « Token symbol »
- `timestamp` — « ISO 8601 datetime of the proof of reserves data »
- `sharesHeld` — « Total shares held across all custody providers »
- `circulatingSupply` — « Total circulating supply of the token »
- `holdings[]` — « Breakdown of shares held by each custody provider », chaque élément portant :
  - `provider` — « Custody provider name »
  - `quantity` — « Quantity of shares held by this provider »
  - `symbol` — « Symbol of the collateral »

### Fréquence — NON TROUVÉ
Aucune cadence de publication (« toutes les X minutes », « quotidien », « temps réel »…) n'est déclarée dans
le schéma OpenAPI ni sur les pages `docs.xstocks.fi` lues. Le seul indice temporel est le champ `timestamp` par
snapshot (horodatage de la donnée, pas une fréquence de rafraîchissement).

### Source du custodian — partiellement trouvé
Le schéma ne nomme **aucun custodian fixe** : `provider` est un champ générique (« Custody provider name »),
déterminé par produit/actif, donc non listé ici en tant que valeur (respect de la consigne : description
seulement). Contexte de gouvernance connexe trouvé sur `docs.xstocks.fi` (page racine, [lu], citations
courtes) : « full 1:1 collateralization on an asset-by-asset basis with no commingling between products,
segregated custody accounts governed by a three-party Account Control Agreement » (22 mots) et, dans la même
phrase, « an independent Security Agent with visibility over collateral, publicly verifiable proof of
reserves, and audited smart contracts » (17 mots). Aucun nom de prestataire de custodie n'est cité dans ce
passage.

---

## 5. API/JSON public de l'émetteur — endpoint, absence de clé, exemple de forme

Source : `https://docs.xstocks.fi/developers` (curl, [lu]) et `https://docs.xstocks.fi/apis/openapi` (curl,
[lu]) + schéma téléchargé `https://docs.xstocks.fi/_bundle/apis/@v2/openapi.json` (curl, [lu], 212 354 octets,
`Content-Type: application/json`).

- **Base URL déclarée** (citation exacte de la page apis/openapi) : `https://api.xstocks.fi/api/v2`
- **Sans clé, confirmé à deux niveaux** : (a) prose, citation exacte (25 mots) : « Public endpoints require no
  authentication and expose asset metadata, pricing data, multipliers, proof of reserves, oracle feeds,
  corporate action schedules, and xStocks public wallet addresses. » ; (b) schéma — chaque endpoint `/public/*`
  porte `"security": []` explicitement dans le JSON OpenAPI.
- **Endpoints pertinents identifiés** (chemins exacts du schéma) :
  - `GET /public/assets` — liste paginée (pageSize max **100**, serveur le fait respecter : testé, un
    `pageSize=500` renvoie HTTP 400 `"Number must be less than or equal to 100"`).
  - `GET /public/assets/{symbol}` — fiche complète par symbole (utilisé pour la table du §1).
  - `GET /public/assets/{symbol}/multiplier`, `/multiplier/history`, `/price-data`, `/circulating-supply`,
    `/total-supply`
  - `GET /public/proof-of-reserves`, `GET /public/proof-of-reserves/{symbol}`
  - `GET /public/oracles` — « List all price oracle contracts across networks », filtrable par
    `managedBy` ∈ {Internal, Chainlink, Pyth} ; champs : `id, createdAt, address, feedType, metadata, network,
    name, symbol`.
  - `GET /public/system/wallets`, `GET /public/corporate-actions/{history,upcoming}`, `GET /public/bridges`
- **Test réel effectué (appel live, méthode d'existence)** : `GET /public/assets/{symbol}/multiplier?network=Solana`
  pour les 4 tickers → HTTP 200 pour les 4 (existence confirmée ; **contenu non lu/non recopié**, seul le
  statut HTTP a été vérifié, par prudence vis-à-vis de la consigne anti-close).

### Exemple de forme (réponse réelle, `GET /public/assets/TSLAx`, HTTP 200, 2026-09-20, champs essentiels
uniquement — réponse complète sauvegardée intégralement dans ce document via le tableau du §1 et le JSON
ci-dessous, trimé à la partie Solana + identité pour lisibilité) :

```json
{
  "id": "96f43a87-976b-4076-ac84-394966c32a90",
  "name": "Tesla xStock",
  "symbol": "TSLAx",
  "isin": "CH1436219252",
  "underlyingSymbol": "TSLA",
  "underlyingIsin": "US88160R1014",
  "underlying": { "symbol": "TSLA", "isin": "US88160R1014", "type": null, "currency": "USD", "listingCountry": "US" },
  "deployments": [
    {
      "address": "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
      "network": "Solana",
      "supportsAtomicSwaps": true,
      "stablecoins": [
        { "symbol": "USDC", "network": "Solana", "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "decimals": 6, "solanaTokenProgram": "TokenProgram" },
        { "symbol": "USDG", "network": "Solana", "address": "2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH", "decimals": 6 }
      ]
    }
  ]
}
```
(Note : les 10 autres déploiements multi-chaînes — Ethereum, BSC, Arbitrum, Tron, Ton, Mantle, HyperEVM, Ink,
XLayer, Optimism — ont été lus mais sont omis ici, hors périmètre Bell/Solana.) Le même schéma a été vérifié
pour SPYx, NVDAx, AAPLx (adresses au §1).

---

## Contradictions / divergences observées (consignées, non tranchées)
1. **Décimales** : `pools.ts` déclare 8 (via son propre contrôle on-chain) ; **aucun document/endpoint émetteur
   lu ne publie ce chiffre** pour le xStock lui-même. Pas une contradiction stricte (rien ne dit le contraire),
   mais un écart de couverture documentaire à signaler.
2. **Nom d'entité dans le temps** (`assets.backed.fi/legal-documentation`) : « Backed Tokens GmbH » / « Backed
   Assets GmbH » (2022-2023) → « Backed Assets » (2024-2026-01) → « Backed Assets (JE) Limited » (à partir du
   PDF daté 2026-07-28, et le pied de page du site). Mécanisme du changement non documenté dans les pages lues.
3. **ISIN du token en préfixe CH alors que l'émetteur est de Jersey** — observation factuelle, aucune
   explication publiée trouvée, non résolue.
4. **Date affichée vs date du nom de fichier** pour le Base Prospectus courant sur `assets.backed.fi` (table :
   « 2026/05/08 » ; nom de fichier : « …20260727… ») — divergence interne mineure à la page émetteur.

## NON TROUVÉ (explicite)
- Décimales du token xStock lui-même publiées par l'émetteur (voir §1).
- Fréquence de publication de la Proof of Reserves (voir §4).
- Nom(s) effectif(s) de custodian par produit (non cherché en live, par prudence anti-close ; le champ existe
  dans le schéma mais aucune valeur n'a été tirée).
- Contenu de `defi.xstocks.fi` (Products/Smart Contracts/Proof of Reserves/Oracles tel que rendu à l'écran) —
  SPA non rendue par les outils disponibles (voir §4).
- Contenu de `https://xstocks.fi/documents/xstocks-terms-of-service.pdf` — URL consignée, PDF non ouvert par
  consigne explicite de la mission.
- Contenu détaillé des PDF listés sur `assets.backed.fi/legal-documentation` (Base Prospectus, Securities
  Notes, Registration Documents) — URLs consignées ci-dessous, aucun PDF ouvert.
- Mécanisme exact du changement de dénomination de l'entité émettrice (GmbH → JE Limited) — non documenté dans
  les pages lues.

## Ce que cette lecture n'établit PAS
- Elle n'établit pas que `defi.xstocks.fi` affiche les mêmes adresses que `api.xstocks.fi` (page non rendue,
  voir §4) — la confirmation de ce document repose sur `docs.xstocks.fi` (prose) + `api.xstocks.fi` (données
  live), pas sur `defi.xstocks.fi`.
- Elle n'établit pas la valeur actuelle de la Proof of Reserves (sharesHeld/circulatingSupply/holdings) pour
  aucun des 4 tickers — aucun appel live n'a été fait sur cet endpoint (choix délibéré, anti-close).
- Elle n'établit pas de lien de causalité/juridique entre « Backed Tokens GmbH » / « Backed Assets GmbH » et
  « Backed Assets (JE) Limited » — seule la chronologie des noms de fichiers et du pied de page est rapportée.
- Elle ne confirme pas le champ `decimals=8` par une source émetteur (reste porté uniquement par le contrôle
  on-chain propre de `pools.ts`, hors périmètre de cette lecture documentaire).
- Elle ne lit pas le contenu des PDF réglementaires (Base Prospectus, Securities Notes) — seules leurs URL et
  noms de fichiers (donc leurs dates et l'entité nommée dans le nom) ont été observés.

## Proposition de texte pour le champ `source` de `pools.ts` (PROPOSITION SEULE — aucune modification de code faite)

Le type `Provenance` (`pools.ts:16-21`) n'a aujourd'hui que `api`, `fetchedAt`, `snapshotSha256`, `onchain`.
Proposition : ajouter un 5e champ optionnel `emitterConfirmed` (ne modifie pas la sémantique des 4 champs
existants ni le contrôle on-chain qui reste, par la méthodologie du fichier, le [lu, first-hand] porteur) :

```ts
readonly emitterConfirmed?: string; // emitter-document/API corroboration — audit only, not load-bearing
```

Valeur proposée, identique pour les 4 entrées `XSTOCKS` (à adapter par ticker) :

```
"https://api.xstocks.fi/api/v2/public/assets/TSLAx (Backed Assets (JE) Limited, issuer API, security:[] — "
+ "no key) — Solana deployment address matches pools.ts char-for-char; read 2026-09-20T18:26Z; issuer identity "
+ "and 'tracker certificate' nature cross-read at docs.xstocks.fi/docs/product-legal-overview; Token-2022 + "
+ "Scaled UI extension cross-read at docs.xstocks.fi/developers (prose, not a structured per-asset API field)."
```
(Remplacer `TSLAx` par le symbole propre à chaque entrée.) Alternative plus légère : un simple commentaire
au-dessus du bloc `XSTOCKS` pointant vers ce fichier d'archive et sa date, sans changer l'interface.

---

## Journal des URL (succès et détours — rien omis)

| Heure (UTC) | URL / endpoint | Méthode | Résultat | Usage |
|---|---|---|---|---|
| 18:18 | `https://docs.xstocks.fi` | WebFetch | [abs] structure du site | orientation, re-vérifié curl ensuite |
| 18:18 | `https://docs.xstocks.fi` (`/docs`) | curl | HTTP 200, 324 413 o. | brut sauvegardé |
| 18:18 | `https://defi.xstocks.fi` | WebFetch | Aucun contenu exploitable (SPA) | limite consignée §4 |
| 18:18 | `https://assets.backed.fi/legal-documentation` | curl | HTTP 200, 41 429 o. | §2 |
| 18:19 | `https://defi.xstocks.fi` | curl | HTTP 200, 522 o. (coquille HTML SPA) | confirme SPA pure |
| 18:2x | `https://docs.xstocks.fi/docs/how-xstocks-work` | WebFetch puis curl | HTTP 200, 326 712 o. | §3 contexte |
| 18:2x | `https://docs.xstocks.fi/docs/product-legal-overview` | WebFetch puis curl | HTTP 200, 348 233 o. | §2 |
| 18:2x | `https://docs.xstocks.fi/docs/issuance-and-redemption` | WebFetch puis curl | HTTP 200, 314 984 o. | aucune mention Solana-spécifique trouvée (raw confirmé) |
| 18:2x | `https://docs.xstocks.fi/docs/dividends-and-stock-splits` | WebFetch puis curl | HTTP 200, 332 261 o. | §3 |
| 18:2x | `https://docs.xstocks.fi/developers` | curl | HTTP 200, 330 697 o. | §1, §5 — mention explicite Token-2022 |
| 18:2x | `https://docs.xstocks.fi/apis/openapi` | curl | HTTP 200, 332 023 o. | §5 — base URL API |
| 18:2x | `https://docs.xstocks.fi/_bundle/apis/@v2/openapi.json` | curl | HTTP 200, 212 354 o., `application/json` | §1, §4, §5 — schéma complet |
| 18:2x | `https://defi.xstocks.fi/assets/index-DUDK5axo.js` | curl | HTTP 200, 278 782 o. | bundle JS inspecté (aucune adresse ni endpoint API en clair trouvés par grep) |
| 18:2x | `https://api.xstocks.fi/api/v2/public/assets?network=Solana&pageSize=100&page=0..6` | curl ×7 | HTTP 200 chacun (~564 Ko chacun) | **détour infructueux** : tri interne non alphabétique par ticker, TSLAx/SPYx/NVDAx/AAPLx absents des 700 premiers actifs Solana paginés — abandonné au profit de l'endpoint par symbole |
| 18:2x | `https://api.xstocks.fi/api/v2/public/assets?network=Solana&pageSize=500` | curl | HTTP 400 « Number must be less than or equal to 100 » | confirme la limite serveur = celle du schéma |
| 18:2x | `https://api.xstocks.fi/api/v2/public/assets?...&listingCountry=US&underlyingType=Equity\|ETF` | curl ×3 | HTTP 200, listes vides | filtre inefficace (champ `underlying.type` = `null` en pratique pour les actifs vus) ; abandonné |
| 18:26-18:27 | `https://api.xstocks.fi/api/v2/public/assets/{TSLAx,SPYx,NVDAx,AAPLx}` | curl ×4 | HTTP 200 chacun (5,4-6,3 Ko) | **§1 — table de confirmation, source directe** |
| 18:2x | `https://api.xstocks.fi/api/v2/public/assets/{TSLAx,SPYx,NVDAx,AAPLx}/multiplier?network=Solana` | curl ×4 | HTTP 200 chacun | existence confirmée seulement, contenu non lu (anti-close) |
| — | `https://xstocks.fi/documents/xstocks-terms-of-service.pdf` | **non ouvert** | — | URL consignée seulement, conforme à la consigne |
| — | 19 PDF listés sur `assets.backed.fi/legal-documentation` | **non ouverts** | — | URLs consignées en §2, dates/entités lues via noms de fichiers uniquement |

**Outils/domaines refusés par un outil pendant cette passe : aucun.** La seule limite rencontrée est technique
(SPA `defi.xstocks.fi` non rendue par WebFetch/curl, §4), consignée et contournée par une source émettrice
alternative (schéma OpenAPI), pas par un outil hors mission.

**Demande de consultation formée : aucune.** Les 4 adresses sont confirmées sans ambiguïté ; les écarts trouvés
(décimales non publiées, fréquence PoR non publiée, généalogie d'entité non documentée) sont consignés comme
NON TROUVÉ plutôt que comme blocages nécessitant un arbitrage.
