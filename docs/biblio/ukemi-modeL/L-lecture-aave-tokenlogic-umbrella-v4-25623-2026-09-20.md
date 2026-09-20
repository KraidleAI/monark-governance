MODELE RESOLU: claude-sonnet-5

# L — Lecture intégrale : TokenLogic, « [ARFC] Umbrella on Aave v4: Coverage Framework and Initial Market Parametrization »

- **Chercheur** : `claude-sonnet-5`, effort max, 2026-09-20. Mission : clôture du procurement « rapports risque DeFi » (item 6.b de `PROCUREMENTS-2026-09-20.md`).
- **Méthode** : API JSON publique Discourse (`curl`, lecture seule, ≥ 1 s entre requêtes, aucun 429 rencontré), thread déjà complet en une seule requête (2 posts). Aucun scraping HTML. Aucun appel à l'outil advisor intégré pendant l'extraction.
- **Usage prévu (ADR-M020)** : PR-UK-9 (« payeur C » — extension shortfall de cluster, D5) ; avis payeur `AVIS-advisor-marche-payeur-ukemi-2026-09-19.md` item 2 ; confirmation du chiffre « deficit offset Core WETH 33 ETH » déjà cité en [2nd] dans ADR-M020.

## 0. Gate 0
Modèle résolu déclaré ligne 1 : `claude-sonnet-5`. Préfixe conforme. Poursuite autorisée.

## Identification (avant extraction)

- **Titre exact** : « [ARFC] Umbrella on Aave v4: Coverage Framework and Initial Market Parametrization ».
- **Thread id** : 25623. **Slug vérifié directement dans le JSON** (champ `slug`, pas reconstruit) : `arfc-umbrella-on-aave-v4-coverage-framework-and-initial-market-parametrization`.
- **URL canonique** : `https://governance.aave.com/t/arfc-umbrella-on-aave-v4-coverage-framework-and-initial-market-parametrization/25623`. **Ceci résout le NON TROUVÉ #7 de `PROCUREMENTS-2026-09-20.md`** (« slug reconstitué depuis le titre... non re-vérifié caractère-près ») pour ce thread précis : le slug est maintenant lu directement dans le JSON, pas deviné.
- **Auteur post #1** : `TokenLogic`, `user_title` = « TokenLogic-Finance SP », `primary_group_name` = « TokenLogic-Finance » (affiliation déclarée par le forum lui-même, pas une inférence).
- **Auteur post #2** : `JosueMpia` (pas de titre/groupe affiché — poste communautaire).
- **Dates** : créé 2026-09-11T14:29:29.026Z (post #1) ; dernier post 2026-09-12T15:00:56.223Z (post #2).
- **Catégorie** : `category_id` 4 = **« Governance »** (mappage vérifié via `governance.aave.com/categories.json`, sha256 `8fb17a89f59a93e881ffda7d369c7c1d1618ca9fee3d9ee773f27d310b0fabdf`).
- **Nombre de posts** : 2 total (`posts_count` = 2, `stream` = 2 ids) — **thread intégralement lu** (2/2), y compris le post #2 que le chercheur du 2026-09-20 (`PROCUREMENTS-2026-09-20.md` item 6.b) n'avait « pas capturé » lors d'une passe antérieure (incident technique local). Aucune telle perte cette fois.
- **Classe** : P1 (forum de gouvernance officiel Aave, publication d'un service provider mandaté).

## Archive brute et sha256

| Fichier | sha256 |
|---|---|
| `recus\aave-discourse\aave-tokenlogic-umbrella-v4-25623-p1.json` (brut, réponse unique, 2/2 posts) | `7a1536f02524c201c6b86ff87078941f237993c82dc131dd43ad29acf605369c` |
| `recus\aave-discourse\aave-tokenlogic-umbrella-v4-25623-FULL-merged.json` (identique au brut ici, thread déjà complet en une requête) | `f731d73b62cb28dd84c1067860cb0ff2a4e4001c07239ab231b110435d77ae8d` |
| `recus\aave-discourse\aave-tokenlogic-umbrella-v4-25623-FULL-digest.txt` (texte nettoyé, lu intégralement) | `3266f5a2220be5dc9fd3dc3333e414c5c3d7183c7f226665a12eda05a54a9885` |

Chemin complet : `F:\PRODUITS\etude-2026-09-20\procurements\recus\aave-discourse\`.

## Post #1 (TokenLogic) — [lu] intégral

### Ce que le post établit (mesuré / proposé, distinction faite)

**Recommandation (proposition, pas un fait mesuré)** : établir des marchés Umbrella généraux pour **Core WETH, Core USDC, Core USDT** sur Aave v4. Pas de couverture recommandée pour USDG, frxUSD, Prime USDC/USDT, Global Dollar/Plus — motifs détaillés par marché (concentration des fournisseurs, dépendance aux incitations, risque de crédit jugé trop faible).

**Chiffres mesurés (« au moment de la rédaction », copiés avec unité, aucun reformulé)** :
- Core WETH : 31 677 ETH (~79,3 M$) de dette en cours ; ~96 % de la dette WETH vient de l'exposition EtherFi (stratégie weETH à effet de levier) ; 826 fournisseurs, ~86,9 M$ de dépôt ; revenu d'intérêt annualisé 88,4 ETH (~221 k$, 30 derniers jours).
- Core USDC : 26,3 M$ empruntés (tous hubs), Core = 13,6 M$ ; collatéral Core ~39,5 M$ (≈2,9×) ; 87,1 % collatéral « pristine » ; 4,3 % de la dette sous HF 1,1 ; 5 plus gros emprunteurs = 34,3 % de la dette ; 826→ non, 384 fournisseurs Core (voir USDG) — Core USDC : plus grande base de fournisseurs diversifiée (top 1 = 6,7 %, top 5 = 24,2 %).
- Core USDT : ~20,6 M$ empruntés (Core = 15,6 M$) ; collatéral ~42,1 M$ (≈2,7×) ; 86,5 % « pristine » ; 2,5 % sous HF 1,1 ; 170 fournisseurs, plus gros = 34,4 %, top 5 = 73,5 %, top 20 = 93,4 %.
- USDG (hors périmètre de la recommandation retenue) : 49,3 M$ empruntés Core / 79,2 M$ combiné ; 32 % sous HF 1,1 ; concentration fournisseurs élevée (avant campagnes, quasi un seul wallet à 100 %).
- frxUSD (hors périmètre retenu) : 19,8 M$ empruntés ; 45 % sous HF 1,1 ; base fournisseurs la plus concentrée (top 1 = 47,2 %, top 5 = 90,5 %), majoritairement affiliée à l'émetteur Frax.

**Spécification technique (proposition chiffrée, tableau « Specification »ою post #1)** :

| Hub/réserve | Cooldown | Unstake window | Target Liquidity | Max Emission/an | Emission APY cible | **Deficit offset** |
|---|---|---|---|---|---|---|
| Core WETH | 20 j | 2 j | 800 ETH | 20,8 ETH/an | 2,6 % | **33 ETH** |
| Core USDC | 20 j | 2 j | 400 000 USDC | 12 800 USDC/an | 3,2 % | 15 000 USDC |
| Core USDT | 20 j | 2 j | 400 000 USDT | 12 800 USDT/an | 3,2 % | 15 000 USDT |

**Confirmation directe d'un chiffre déjà cité en [2nd] dans ADR-M020 (PR-UK-9)** : « deficit offset Core WETH 33 ETH » — **maintenant [lu]**, table « Deficit offsets » du post #1, verbatim tableau : « Core WETH | 33 ETH ».

**Mécanisme de deficit v4 (narratif, décrit — à distinguer du mécanisme v3.3 déjà documenté en [lu] par `R-web-capo-uniswap-eip-2026-09-19.md` Cible 5)** : « the Spoke calls reportDeficit on the relevant Hub in the same transaction. Any permissionless liquidator executing liquidationCall can therefore trigger deficit recognition » (paraphrase courte, ≤ 25 mots respectés par fragmentation). Deux registres publics : `asset.deficitRay` (par actif de Hub) et `spoke.deficitRay` (par Spoke), lisibles via `getAssetDeficitRay`/`getSpokeDeficitRay`. Élimination : `eliminateDeficit(assetId, amount, spoke)`, brûle les parts Hub du Spoke appelant (pas de transfert de token vers le Hub) — capital Umbrella reste productif jusqu'à usage.

**Architecture v4 (contexte mesuré)** : Aave v4 remplace le pool monolithique v3 par des **Hubs** (détiennent la liquidité) et des **Spokes** (créent la dette) ; sur Ethereum, 4 Hubs, 12 Spokes emprunteurs. Dépôts v4 ~596 M$, prêts actifs ~226 M$ (doublement ~6 semaines, ~5 mois de suite) ; v4 = ~2,1 % des emprunts v3+v4 combinés sur Ethereum. Lancement avril 2026.

**Disclaimer (transparence déclarée)** : TokenLogic est SP actif, bénéficiaire du stream 100086, périmètre défini par le thread 24846.

### Distinction structurelle IMPORTANTE pour Ukemi (à ne pas conflater)

Ce thread concerne **exclusivement Aave v4** (architecture Hub & Spoke, marchés WETH/USDC/USDT de Core v4, lancé avril 2026). Le programme Ukemi (ADR-M020 D1) cible **Aave v3 core Ethereum**. Le mécanisme de `reportDeficit`/`asset.deficitRay` décrit ici est **différent** du mécanisme v3.3 déjà documenté ([lu], `DeficitCreated(address,address,uint256)`, topic0 `0x2bccfb3f...`, event séparé de `LiquidationCall`). Les deux coexistent sur des versions de protocole distinctes ; toute citation de ce thread pour Ukemi doit préciser « v4 », pas « v3 core ».

## Post #2 (JosueMpia) — [lu] intégral, position communautaire (pas un fait)

Deux critiques structurelles, non tranchées par TokenLogic dans ce thread (aucune réponse ultérieure, thread clos à 2 posts) :
1. **Verrouillage temporel des Spokes couverts** : un nouveau Spoke approuvé après coup ne devrait pas accéder immédiatement au capital Umbrella existant sans un préavis complet (cooldown 20 j + fenêtre 2 j = 22 j), sous peine de modifier rétroactivement les conditions acceptées par les stakers.
2. **Anti-free-riding** : proposition (non chiffrée formellement, esquissée) d'une contribution de première perte par Spoke = exposition Hub × facteur de stress × risque de concentration × prime de risque, avant sollicitation du capital Umbrella au niveau du Hub. Critique explicite du chiffre « 826 fournisseurs » du post #1 : « broad » en nombre mais ~96 % de la dette WETH concentrée sur une seule stratégie EtherFi — la diversité du capital ne reflète pas la diversité du risque sous-jacent.

Vote annoncé : YES, avec réserve « Umbrella v1 ».

## Contradictions

Aucune contradiction interne détectée dans ce thread (2 posts, pas de chiffre répété deux fois différemment). **Contradiction externe à signaler, non tranchée** : le post #2 met en doute la lecture directe « 826 fournisseurs = base large donc diversifiée » du post #1 sur la seule base de la concentration du risque sous-jacent (EtherFi ~96 %) — une critique méthodologique, pas un chiffre contradictoire.

## Ce que ce thread n'établit pas

- Aucune donnée sur Aave v3 core (hors périmètre du thread).
- Aucune confirmation que le mécanisme `reportDeficit`/Hub-Spoke s'applique ou s'appliquera à v3 core.
- Aucune suite : le thread s'arrête au post #2 (2026-09-12), pas de Snapshot/AIP visible dans les données récupérées ce jour (2026-09-20) — possible que le vote ait eu lieu après cette date de création (9 jours avant la lecture), mais **aucune donnée de suite n'est dans ce thread lui-même** (pas de post #3 dans le stream ; NON TROUVÉ, pas une absence de ma part — le `stream` JSON confirme 2 ids seulement au moment du fetch).
- Pas de confirmation indépendante du chiffre « 826 fournisseurs » ni des pourcentages de concentration (aucune vérification on-chain faite cette passe).

## NON TROUVÉ

1. Suite du vote (Snapshot/AIP) au-delà du 2026-09-12 — thread arrêté à 2 posts au moment du fetch (2026-09-20) ; à re-fetcher plus tard si utile.
2. Vérification on-chain indépendante des chiffres de TVL/concentration cités par TokenLogic (non vérifiés cette passe, confiance = déclaration du SP).

## Procurement formé

Aucun nouveau procurement bloquant issu de ce thread : le contenu est intégralement lu et public. Résiduel léger, non bloquant : vérifier un éventuel post #3+ (vote) via un re-fetch ultérieur de `governance.aave.com/t/25623.json` si une décision finale sur Umbrella v4 devient pertinente pour Ukemi.

## Journal des URL (doc 03 règle 6)

| URL | Outil | Résultat | Date |
|---|---|---|---|
| `governance.aave.com/t/25623.json` | curl (politesse respectée) | 200, 2/2 posts (thread déjà complet) | 2026-09-20 |
| `governance.aave.com/categories.json` | curl | 200, mappage category_id 4 = Governance confirmé | 2026-09-20 |

Aucun 429 rencontré sur ce thread.
