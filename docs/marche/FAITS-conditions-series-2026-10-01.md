# FAITS — conditions d'utilisation des séries de marché (Coinbase, Binance), lues avant toute requête

Lu sur place par l'orchestrateur MONARK (navigateur interne), le 2026-10-01 entre 00:54 et 01:01 UTC (horloge lue à 00:54:29,
00:54:57 et 01:01:42). Aucune requête n'a été faite aux points d'accès de données avant ce fichier. Les clauses sont résumées avec
leur intitulé ; une seule citation (moins de 15 mots). Empreintes : sha256 calculé DANS le navigateur (`crypto.subtle`), sur le
texte rendu (`innerText` UTF-8) pour une page HTML, sur les octets du fichier pour un PDF.

## 1. Coinbase — Market Data Terms of Use

- **URL** : https://www.coinbase.com/legal/market_data ; « Last updated: August 7, 2026 » ; lue à 00:54 UTC.
- **sha256** du texte de `<main>` : `7acae283b3413cd716c579a94e8bf5f7e5d66298719b5fd5614c016106953d58` (15 148 caractères).
- **Portée** : « Market Data » désigne toutes les données que Coinbase rend disponibles, sans limitation. Cela couvre les bougies du
  point d'accès public `api.exchange.coinbase.com`. Le contrat est accepté par le seul fait d'accéder aux données ou de les utiliser.
- **Licence** (Permission to Use Market Data) : licence limitée, révocable, non transférable. L'usage est réservé à soi ou à son
  entité, à des fins personnelles ou de recherche. Aucune application destinée à des utilisateurs finaux hors de l'entité.
- **Interdits sans accord écrit de Coinbase** (Restrictions and Responsibilities) :
  - redistribuer, afficher ou diffuser les données à un tiers hors de l'organisation, ainsi que toute œuvre dérivée : données,
    graphiques, analyses, recherches fondées sur elles (« Derived Works ») ;
  - en tirer des indices, des prix de référence ou des valorisations de produits financiers, ou s'en servir comme référence ;
  - les utiliser pour développer, entraîner, valider, étalonner ou améliorer tout modèle d'IA ou d'apprentissage, tout algorithme,
    agent ou système automatisé, ou pour tout autre but lié à la recherche, au développement ou au fonctionnement des technologies
    d'IA (« develop, train, fine-tune, teach, validate, benchmark »).
- **Propriété** : les données et les droits sur elles (droit d'auteur, droit des bases de données) appartiennent à Coinbase.
- **Contact pour un accord** : marketdata@coinbase.com (section California Residents).

**Lecture MONARK.** La bibliothèque de stratégies étalonne des prédicteurs sur ces séries. Ces prédicteurs sont ensuite servis à des
agents d'IA. Cet usage tombe sous l'interdit IA (étalonner, valider ou améliorer un système automatisé ; but lié au fonctionnement
de l'IA). Les étalonnages servis sont aussi des œuvres dérivées diffusées hors de l'organisation. **Statut : enregistrement de
Coinbase BLOQUÉ** tant qu'aucun accord écrit de Coinbase n'existe. Décision du fondateur ; aucune requête faite.

## 2. Binance — Terms of Use (entités ADGM) et conditions de l'API Spot

- **Conditions générales** : https://www.binance.com/en/terms. La page affiche un PDF de 73 pages : 1 362 587 octets, « Effective
  Date: 21 July 2026 », entités ADGM (Nest Exchange Limited et autres). Lu à partir de 00:54:57 UTC.
- **sha256 des octets du PDF** : `bf4879710c904b991848972ec4818ba2cf9e4ce314c09adae84fa2750d3477f7`, égal au nom du fichier servi
  (`bin.bnbstatic.com/static/cms/cg08ou2ak0tn7mcplvfg/file/<sha256>.pdf`). sha256 du texte extrait :
  `fc646eb854f753c17958a137ee5b24839d30c9ab427c18b15d25b5cf279c20a4`.
- **Conditions de l'API Spot** : https://developers.binance.com/en/docs/products/spot/PROD-TERMS-OF-USE. Cette page renvoie aux
  « Product Terms of Use », c'est-à-dire aux mêmes conditions générales (`/en/terms`). Aucun texte propre à l'API n'est publié.
- **Clauses pertinentes** :
  - 14.1.2 (b) : l'accès par les API Binance est soumis à des conditions d'API distinctes et à l'approbation de Binance. Ces
    conditions distinctes sont la page ci-dessus, qui renvoie aux conditions générales.
  - 27 (licence de la « Binance IP ») : licence non exclusive, limitée à ce qui est nécessaire pour recevoir les services, pour un
    usage personnel non commercial ou interne à l'entreprise. Aucune licence de redistribution.
  - 31.1 (usages interdits) : engagement pris en ouvrant un compte ou en faisant une transaction. Renvoie à une « Prohibited Use
    Policy » incorporée par référence (point (c) de la liste des documents incorporés), sans URL dans le texte.
  - 33.11 (données de tiers) : sans garantie ; usage aux risques de l'utilisateur.
  - Aucune clause trouvée sur l'entraînement ou la validation de modèles d'IA par les données de marché. Recherche par mots dans le
    texte extrait : scrap, crawl, robot, market data, artificial intelligence, machine learning, redistribut, derivative.
- **AI Policy** (incorporée par la clause 22.2) : https://www.binance.com/en/about-legal/AI-Policy. PDF de 31 pages, 609 941
  octets, version 2.1 du 25 mars 2026 ; sha256 des octets
  `70c8937ef687f2e81dea643381aa9fe57fd9b0fc5c86a943e99ba8047382ea49`. Elle régit l'usage par Binance de l'IA et l'usage des outils
  d'IA de Binance. Aucune restriction trouvée sur l'usage des données de marché publiques pour un modèle tiers.
- **Non lu** : la « Prohibited Use Policy » de Binance. Elle n'a d'URL ni dans les conditions ni sur binance.com (recherche faite).
  **Demande formée au fondateur** : procurer ce document ; sinon, écrire à Binance pour qu'il le communique.

**Lecture MONARK.** Enregistrer les bougies publiques sans compte, sans clé et sans coût, pour une recherche interne, entre dans
« usage interne à l'entreprise ». **Statut de redistribution : NON redistribuable.** Aucune licence n'est accordée pour cela. Les
séries brutes ne vont jamais dans un dépôt public et sont exclues d'`export-public`. Elles sont stockées hors de tout dépôt. Servir
publiquement un étalonnage dérivé de ces séries (un kata) n'est pas couvert clairement par la licence (« non commercial » ou
« interne »). **Décision du fondateur avant tout kata servi**, comme pour l'accord écrit éventuel de Binance.

## 3. Conséquences pour l'enregistrement (condition C-5)

- Coinbase BTC-USD : non enregistré. Bloqué par l'interdit IA et par l'interdit des œuvres dérivées ; décision du fondateur.
- Binance BTCUSDT, ETHUSDT, BNBUSDT : enregistrables pour la recherche interne, après relecture de l'enregistreur par RECHERCHES.
  Ce sont des séries brutes non redistribuables. Le service public d'un kata qui en dérive attend une décision du fondateur.
