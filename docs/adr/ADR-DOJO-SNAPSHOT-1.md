# ADR-DOJO-SNAPSHOT-1 : MONARK Dōjō, pièce 1 — snapshot daté des soldes MONARK, score de détention, seuil public, publication signée et chaînée (G0, plan de sprint sans code)

- **Statut** : proposé (G0). En attente du checkpoint-1 (validateur-humain) et des décisions de l'investisseur sur les points du §10. Ce document n'écrit aucun code ni test, ne committe rien, n'émet aucun appel réseau ni RPC (R-20 ; règle de mission).
- **Rédaction** : worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` déclaré à l'ouverture, R-1), effort max, contexte frais. Mission de l'orchestrateur `claude-fable-5-1` : `F:\tmp\dojo\mission-g0-snapshot.md`, sha256 `8dcd4bec6840afb53766565d0e1ddbfc449c427b8d669031e75052ae7e2c9abc` (recalculé égal à l'ouverture). Horloge `date -u` : 15:34:00Z (ouverture, `git status`), 15:42:14Z (relecture du brief modifié), 15:50:39Z (mesures), 15:56:44Z (état du worktree), 15:59:52Z (début de l'écriture) ; l'heure du hachage final est rendue hors du fichier.
- **Base lue** : worktree `F:\Monark-wt-dojo`, branche `lot/dojo-snapshot-1`, HEAD `9ee4ab35b9ea17a9ac8de5affce14053466225a8`, `git status --short` vide. Le tronc `lot/etude-suite` est à `d561a0f` ; base de fusion = `9ee4ab3` ; `git diff --stat HEAD...lot/etude-suite` = `docs/CHANTIERS.md` +2 et `docs/dojo/BRIEF-DOJO-2026-09-25.md` +9 (commits `dc6e99b`, `d561a0f`), aucun code : le brief du tronc est lu dans `F:\Monark` (§1.1). Toute référence `fichier:n` est lue à `9ee4ab3`, niveau [lu] sauf mention contraire.
- **Rattachement** : décisions 218 (`docs/CHANTIERS.md:1516`), 221 (`:1535`), 222 (`:1553`) ; brief `docs/dojo/BRIEF-DOJO-2026-09-25.md` ; plan proposé `docs/dojo/PLAN-PROPOSE-2026-09-25.md` §2 pièce 1 (l.17-22) et §3 (l.46-49, l.55) ; audit Vernier `docs/dojo/AUDIT-ETUDE-VERNIER-2026-09-25.md` §1 points 1 (l.9) et 5 (l.13) ; ADR-M018 D3 (tuyaux) ; ADR-M013 l.20 (régime T2) ; modèle Bell : `docs/adr/ADR-BELL-OTS-ANCHOR-1.md`, `docs/adr/ADR-BELL-OTS-PRB.md`, `docs/RUNBOOK-bell.md`.
- **Gate concerné** : G0 (doc 02). **Propriétaires des décisions** : l'investisseur pour P-1 à P-13 (§10.1) ; le validateur-humain au checkpoint-1 pour P-14 à P-22 (§10.2). **Éléments affectés** : nouvel espace de travail `apps/dojo/` ; `packages/rpc-guard` (liste de méthodes) ; `scripts/` (synchro, contrôle de conformité, assertion du rendu, export) ; `apps/site` (données, chargeur, page `/dojo`, registre Dōjō) ; `deploy/` ; `package.json`, `tsconfig.json` ; hôte de publication (P-7).

## 0. Décisions proposées, une ligne chacune

- **D-1 (frontière)** : la pièce 1 publie, pour chaque jour UTC, les soldes MONARK lus sur la chaîne par adresse détentrice, un score de détention par adresse et un seuil public ; elle ne dit rien de ce que le seuil ouvre (l'agent est la pièce 2) et ne touche ni au moteur, ni aux onze agents, ni aux six applications du registre.
- **D-2 (formule)** : score = somme, sur les jours comptés, de la part encore détenue ; valeur du jour = plus petite lecture concordante du jour ; toute baisse remet à zéro la part sortie, la plus récente d'abord (LIFO), ce qui égale exactement la somme des minima glissants (M2 : 0 écart sur 20 000 suites) ; aucun plafond ; entiers décimaux en chaîne (BigInt), jamais un nombre JavaScript (M1).
- **D-3 (seuil et unités)** : seuil fixe et public en jetons-jours, porté par chaque ligne signée, changé seulement par une ligne signée et jamais rétroactivement ; si un compte est publié, c'est `floor(score / seuil)` par adresse, invariant au fractionnement (M2) ; âge minimal au choix de l'investisseur.
- **D-4 (lectures)** : K lectures par jour à des instants tirés d'une chaîne de graines dont l'ancre est publiée et signée avant le premier jour compté, chaque graine révélée après son jour ; engagement `finalized` ; quorum de deux opérateurs distincts par compte de jetons ; contrôle quotidien du mint (programme, décimales, extensions) ; un jour sans lecture concordante ne compte rien et ne remet rien à zéro.
- **D-5 (énumération)** : `getProgramAccounts` sur le programme Token-2022 filtré par le mint, sous le garde `@monark/rpc-guard` (Helius 10 crédits par appel, opérateur sans clé à 0) ; `getTokenAccountsByOwner`, `getTokenLargestAccounts` et l'API DAS sont rejetés pour l'énumération ; forme de requête et de réponse, acceptation par l'opérateur public et coût réel NON CONFIRMÉS, établis par la sonde SNAPSHOT-PROBE-1 avant le G1 du collecteur.
- **D-6 (exclusion)** : un propriétaire hors de la courbe Ed25519 est une adresse de programme ; sa ligne est publiée avec la classe `program` et un score nul ; critère pur, recomputable hors ligne par tout lecteur (M3 : quatre adresses de contrôle sur quatre classées comme leurs rôles [2nd] le laissent attendre).
- **D-7 (lignes, racine, preuve)** : une ligne par adresse, JSON canonique de Bell, triées par adresse, fichier immuable par jour ; arbre de Merkle standard à préfixes de feuille et de nœud distincts (structure de RFC 6962 §2.1, lecture due avant le G1 : FAITS-RFC6962-1) ; une seule racine par jour, portée par la ligne signée ; la preuve d'inclusion d'une adresse est calculée par le vérificateur.
- **D-8 (chaîne et clé)** : chronologie `dojo-timeline-v1` signée Ed25519 et chaînée avec les primitives de `apps/bell/scripts/bell-chain.mjs`, importées sans modification ; marcheur propre, calque déclaré de `walkTimeline`, que M1 montre lié au schéma Bell ; clé Dōjō distincte de celle de Bell, générée sur l'hôte ; trousseau public committé comme racine de confiance.
- **D-9 (hôte)** : recommandé : l'hôte Bell (`178.16.131.29`) avec unité, utilisateur, racine servie, nom (`dojo.monarkgate.tech`) et clé distincts ; choix de l'investisseur (P-7), avec amendement de la CA de Bell.
- **D-10 (vérificateur)** : `apps/dojo/scripts/dojo-verify.mjs`, modules intégrés de Node seuls, exporté ; il recalcule chaîne, graines, racine, lignes, scores, classes et preuve d'inclusion depuis les seuls fichiers servis ; codes de refus en liste fermée ; il ne lit pas la chaîne Solana et le dit.
- **D-11 (site)** : synchro vers `apps/site/data/dojo-served.json` haché au manifeste, chargeur fail-closed, page `/dojo` ; chiffres rendus depuis le fichier et contrôlés au rendu par liste fermée (motif de la décision 217) ; registre Dōjō distinct de `fleet.ts`.
- **D-12 (textes)** : textes publics anglais en liste fermée (§8), lexique fermé, aucun fournisseur, aucune promesse.
- **D-13 (tuyaux)** : dix tuyaux déclarés (§5), tous absents au 2026-09-25.
- **D-14 (série)** : sept PR, chacune estimée sous 1 150 lignes CODE même au pire facteur de dérive mesuré sur Bell (×2,0), au lieu des deux PR suggérées, qui dépasseraient la borne de 1 205 (§7).
- **D-15 (anti-close et secrets)** : aucun prix ni valeur monétaire dans une ligne (clés fermées) ; aucune clé ni graine non révélée dans le dépôt ; A-7 sur toute commande ; `[masqué]` pour toute valeur non publique.

## 1. Contexte mesuré

### 1.1 Ce que l'investisseur a dit, et ce qui en est public

- Brief lu en deux versions : celle du worktree (`9ee4ab3`), sha256 `caad639157ecf6ba9864819c6c9bf5ac63802302a9c119334480b2c36da1a808` ; celle du tronc (`F:\Monark`, `d561a0f`), sha256 `ec39ff0275d4fca2308b78b05ad482c1303354376a3f5cfd78564e9d2ebfb90c`, qui ajoute le §5 (« ce sont les mauvais scores qui nous intéressent », pièces 3 et 5). Ce §5 ne touche pas la formule de la pièce 1 ; il crée une collision de mot : « score » y désigne le résultat d'un agent. La page de la pièce 1 dit donc « hold score », jamais « score » seul (§8).
- Mots de l'investisseur (brief l.7, l.11) : « Les holders produisent un score calculé par le nombre de tokens holdés ainsi que la période de hold. » ; « On fixera un seuil où un holder obtient son agent. » ; « Les snapshots vont bientôt commencer, visibles pour tout le monde sur notre plateforme. »
- Ce sont des mots de discussion. Aucun texte public de l'investisseur sur le Dōjō n'a été trouvé dans le dépôt : `docs/communication/` ne porte que `TWEET-2026-09-24-fondation.md`, sans occurrence de dojo, snapshot, holder ou agent ; les cartes du sondage X (« MONARK DŌJŌ », `F:/tmp/dojo/cards/make-cards.mjs:31`) sont hors dépôt, leur publication n'est pas confirmée (§12). La page ne reprend donc ni « agent », ni « bientôt », ni une date (P-10).
- Hypothèses de cadrage de l'orchestrateur (mission l.16-19) : H1 score = somme sur les snapshots de min(solde, plafond) × 1 jour, départ au premier snapshot public, remise à zéro de la part vendue ; H2 seuil fixe et public en score ; H3 une adresse = un score, sans agrégation ni parrainage ; H4 snapshot quotidien à heure fixe UTC.

### 1.2 Le token MONARK

- Mint `FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT` : `out/mint.txt` (45 octets, LF final), épinglé par `test/token-ca-pinned.test.ts:14` et `:17-24` (`token_ca_pinned` : page `/token`, README, `out/mint.txt`), exporté (`scripts/export-public.mjs:86-93`).
- **Écart de mission** : la mission (l.13) attribue cette épingle à `test/site-build-fleet.test.ts`. Ce fichier, lu en entier (1 542 lignes), ne porte pas le mint (recherche du mint : 0 occurrence) ; il ne nomme `apps/site/app/token/page.tsx` qu'à `:1070`, pour la règle B_t. Le porteur réel est `test/token-ca-pinned.test.ts` (item MISSION-PIN-FILE-1, informatif).
- Programme Token-2022 (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`), 6 décimales, offre totale 10^15 unités de base : **[2nd]** via `docs/token/DOSSIER-COINGECKO-MONARK.md:28-31` et `docs/token/SOURCES-coingecko.md:95-96` (JSON de la page de lancement lu par un chercheur le 2026-09-22). Extensions Token-2022 **non vérifiées** (`DOSSIER:75-84`). Comptes nommés par la même source, **[2nd]** : créateur `BQPsJEawxaostAfQ3USyLBHkdLiEQ46Py6CkDFHyk3QV`, courbe de liaison `2v82mDXA1cpm9yba5cnJX6gjr9b4wxMd3wsJfoRy1m6F`, compte associé `6tW6Vb8mwoKHhRommxq4TLwMUTdBfgKMKFKfwyFMyYWo`, pool `GhCGq9qTCBWZvpBY4fzfvxvENWe1syryLuGACgj3Lhvg` (`SOURCES:96`), contrat de verrou `63dKEiLjxBHg3ZGTy4ApyAcJYFgePrPNr4s46RNVb1Pn` (`DOSSIER:35`). Lecture de première main due : SNAPSHOT-PROBE-1 (a).

### 1.3 Comment Bell lit Solana (le code, pas la chaîne)

- **Transport** : les endpoints ne sont plus résolus dans Bell ; le `call` injecté parle en libellés d'opérateurs, et le garde `@monark/rpc-guard` est le seul lieu libellé → URL et le seul `fetch`, la clé étant lue de l'environnement (`apps/bell/src/rpc.ts:5-11`). Opérateurs Solana du garde (`packages/rpc-guard/src/transport.ts:86-114`) : `helius` (crédits ; `BELL_SOLANA_RPC` et `HELIUS_API_KEY`), `chainstack` (unités de requête ; `CHAINSTACK_SOLANA_URL` quand `network` vaut `"solana-mainnet"`), `solana-foundation` sans clé sur `https://api.mainnet.solana.com` (l.111-114), jamais l'hôte exclu `mainnet-beta`.
- **Quorum** : `quorum2` (`apps/bell/src/quorum.ts:89-122`) exige deux opérateurs distincts au sens d'`operatorOf` (`apps/bell/src/operators.ts:14-33` : deux hôtes d'un même fournisseur comptent pour un) qui concordent sur la clé de la lecture ; sinon `NoQuorumError`, `QuorumDisagreementError` ou `ConcordantRevertError`. Une faute de transport ne garde que `{provider, status}`, jamais l'URL ni le message (l.11-14). Opérateurs par défaut de Bell : `["helius", "solana-foundation"]` (`apps/bell/src/collect.ts:685`). Clé d'ensemble indépendante de l'ordre : `signaturesSetKey` (`quorum.ts:165-170`).
- **Lecture d'un mint Token-2022** : `getAccountInfo` `jsonParsed` sous quorum (`collect.ts:591`) ; `readMintToken2022` (`apps/bell/src/supply.ts:62-77`) lit `supply`, `decimals`, `scaledUiAmountConfig`, `pausableConfig`, `permanentDelegate`.
- **Classement d'un propriétaire** : `readAccount` et `confirmVault` (`apps/bell/src/discover.ts:143-172`) lisent sous quorum le propriétaire du propriétaire : Programme Système ⇒ `system-owned-pda-or-wallet` ; programme ⇒ `program` ; compte absent ou quorum manqué ⇒ `unread`.
- **Méthodes admises** : `BELL_SOLANA_METHODS` = `getSignaturesForAddress`, `getTransaction`, `getAccountInfo`, `getTransactionsForAddress` (`packages/rpc-guard/src/bell-methods.ts:9-11`) ; un plafond par méthode est exigé à la construction (`assertMethodCapsCover`, `:16-19`).
- **Énumérer les comptes de jetons d'un mint : aucun code du dépôt ne le fait.** `getProgramAccounts` n'apparaît que dans la table tarifaire (`packages/rpc-guard/src/tariff.ts:14`) et ses tests. `node_modules` ne contient aucun paquet `@solana/*` ; la recherche de `getProgramAccounts|getTokenLargestAccounts|getTokenAccountsByOwner` dans les `.d.ts` de `F:/Monark/node_modules` (218 entrées) rend 0 fichier ; `supply.ts:57-58` constatait déjà l'absence de `@solana/spl-token` au 2026-09-20. Les formes de requête et de réponse ne sont lisibles ni dans le code ni dans des types : **NON CONFIRMÉ** (§12).
- **Tarifs (M1, `tariff.ts` et `bell-methods.ts` exécutés hors ligne)** :

| Méthode | Helius (crédits) | Chainstack (unités) | dans `BELL_SOLANA_METHODS` |
|---|---|---|---|
| `getAccountInfo` | 1 | 1 | oui |
| `getMultipleAccounts` | 1 | refusée | non |
| `getProgramAccounts` | 10 | refusée | non |
| `getTokenLargestAccounts` | refusée | refusée | non |
| `getTokenAccountsByOwner` | 1 | refusée | non |
| `getTokenAccounts` (DAS) | 10 | refusée | non |
| `getSignaturesForAddress` | 1 | 2 | oui |
| `getTransaction` | 1 | 2 | oui |
| `getBlock` | 1 | 2 | non |

« Refusée » : la table fermée lève (fail-closed, `tariff.ts:24-30`, `:80-87`). L'opérateur sans clé porte la version `keyless-0`. Barème Helius, lu sur place par l'orchestrateur (`F:\PRODUITS\etude-2026-09-21\helius-audit\FAITS-tarification-helius-2026-09-21.md:4`, sha256 `cc051ace072238a0cab2659c64672f6c7bad4550c67b6101aabd81cdb0accf95`) : « RPC calls are 1 credit with two exceptions: getProgramAccounts and archival calls are 10 credits. »

### 1.4 Le modèle de publication de Bell, et ce qui se réutilise

- **Chaîne** (`apps/bell/scripts/bell-chain.mjs`, modules intégrés seuls) : `canonical` (l.14-22), `lineHash` (l.51), `signLine` et `verifyLine` Ed25519 (l.74-82), `trustOf` (l.106-117), `walkTimeline` (l.125-157). **M1** : `walkTimeline` rend `timeline_malformed` pour le schéma `dojo-timeline-v1` et pour le type `snapshot` sous le schéma Bell (l.131, types fermés l.102) ; il ne peut pas marcher une chronologie Dōjō.
- Modifier `bell-chain.mjs` change l'arbre déployé de l'hôte Bell, deux fichiers comparés au blob du G7 par le contrôle 11 de la CA (`docs/RUNBOOK-bell.md:22-24`, `:322-340`) : tout octet changé impose un redéploiement de Bell et une nouvelle capture. D'où D-8 : importer sans modifier.
- **Clé** : générée sur l'hôte, jamais sur la machine opérateur ni dans le dépôt, 0600 root, passée à l'unité hors réseau par `LoadCredential` (`RUNBOOK-bell.md:57-65`, étape 4 `:125-138`) ; jamais affichée (`:31-34`, « Never » `:501-508`) ; contenue dans les sauvegardes hebdomadaires du fournisseur (ESC-2, `:57-65`).
- **Éditeur** : unité hors réseau ; publication = acte opérateur ; aucune collecte sur l'hôte (`:3-7`) ; seul écrivain de `public/`, dans un ordre durable (ADR-BELL-OTS-ANCHOR-1 l.157) ; un même paquet publié deux fois ne publie rien (`RUNBOOK-bell.md:457-463`).
- **Vérificateur** (`apps/bell/scripts/bell-verify.mjs`) : racine de confiance = trousseau fourni, sinon statut `self_consistent_only` (l.1-9, l.114-116) ; codes de refus fermés (l.16-19) ; bornes chiffrées et motivées (l.25-28).
- **Site** : `scripts/sync-bell-served.mjs` lit les corps servis, marche la chaîne sous le trousseau committé, exige le contrôle de déploiement committé sur ces mêmes corps, écrit l'entrée du manifeste (l.1-20, l.59-89) ; `apps/site/lib/bell-served-load.ts` : projection pure `buildBellServed` (l.478) et chargeur `loadBellServed` fail-closed sur le sha256 et la forme fermée (l.358-366) ; `setManifestEntry` (l.441-446). Test d'intégration inscrit au registre : `bell_served_data_matches_deploy_ca` (`test/bell-served.test.ts:134`) ; la fixture signée génère sa clé à l'exécution (`:314-315`), aucune clé privée n'est committée.
- **Export public** fichier par fichier : chaîne, éditeur, vérificateur, trousseau et CA de Bell sont exportés ; collecteur, tests, `docs/**` et `deploy/**` ne le sont pas (`scripts/export-public.mjs:94-108`). Conséquence : l'ADR n'est pas publié ; les surfaces publiques ne nomment aucun opérateur.

### 1.5 Registre et régime de la vitrine

- `apps/site/lib/fleet.ts` : `FLEET_AGENTS` (onze agents, l.128) et `PRODUCTS` (six applications, l.291 ; Bell seule construite, l.339-362). Le test de gel exige exactement six applications, quatre agents construits et douze entrées à venir (`test/ci-gates.test.ts:981`, `:993-994`). `productStatusSentence` ne sert « each cleared by the shared gate » que tant que toute application à venir passe par la porte partagée (`fleet.ts:421-428`). Or « L'agent ne sera pas branché sur le moteur MONARK » (brief l.10) : inscrire le Dōjō dans `PRODUCTS` rougirait le gel et fausserait cette phrase servie. Le Dōjō n'est pas une pièce de la flotte (mission l.12).
- ADR-M013 l.20 : un registre, une phrase publique nouvelle, un chiffre nouveau, la liste d'export, un nouveau service ⇒ régime T2, cérémonie complète.
- Portes qui s'appliquent à tout fichier exporté de `apps/site`, commentaires compris : noms d'opérateurs (`test/site-build-fleet.test.ts:769-772` et `OPERATOR_FORMS` `:1403-1409`), sources de données (`:267-276`), vocabulaire de cuisine (`KITCHEN_FORMS` `:1114-1125` : « worker », « checkpoint », « orchestrator », « G0 »…« G7 », « lot X-Y », « decision n », « ADR-… »), comptes tapés en mots (`:386`), chiffres en source de page (seuls 256 et 25519 admis : ADR-BELL-OTS-ANCHOR-1 l.189). `countWord` s'arrête à « twelve » (`fleet.ts:371-381`) : un nombre de lignes ne peut pas s'écrire en mots ; il se rend depuis le fichier sous liste fermée, comme `/ukemi` (`scripts/assert-fleet-html.mjs:381`, décision 217).

### 1.6 Les hôtes

- Deux machines : `monarkgate.tech` = `31.97.155.188` et `bell.monarkgate.tech` = `178.16.131.29` (`docs/CARTOGRAPHIE-BRANCHEMENT-2026-09-24.md:48`, « IP lue par curl » ; `docs/PASSATION-2026-09-24.md:62`). Le VPS du site porte `next start`, le harnais et la sentinelle Narabi, tâche quotidienne à RPC sortant (`docs/RUNBOOK-vitrine.md:3-5`, `docs/RUNBOOK-sentinel.md:3-10`) ; la sentinelle ne signe rien (recherche de `signLine|ed25519|createPrivateKey|sign(` dans `apps/sentinel/src/*.ts` : 0 ligne). Seul l'hôte Bell porte une clé de signature.
- **Contradiction relevée** : `docs/roster/FAITS-github-actions-billing-runners-2026-09-25.md:24` écrit que `31.97.155.188` « sert le site et l'hôte Bell » et en porte la clé ; les deux sources ci-dessus le contredisent. La conclusion de ce FAITS (un runner sur l'hôte Bell exposerait la clé) reste vraie pour `178.16.131.29` (item FAITS-RUNNERS-HOST-1).

### 1.7 Écarts du plan relevés par les lectures

- Plan §1.2 : « Messias et al. 2023 : jusqu'à 66 % des tokens d'airdrop revendus rapidement » et « Les récompenses à la détention attirent des fermiers ». Messias Q5-1 (p. 1, 7-8) : le « 66 % » est la part des tokens dont le premier transfert, sans fenêtre de temps, va vers un échange étiqueté ; ce maximum viendrait d'un airdrop à 516 destinataires (reconstruction du lecteur) ; le papier ne mesure pas de récompense à la détention. Q5-2 (p. 1, 6, 7) : l'attribution aux fermiers est une interprétation, sauf le cas Gemstone (p. 25). Ce G0 n'emploie donc ce chiffre nulle part.
- Plan §2 pièce 1 : « nombre de holders au-dessus du seuil » sur la page. Messias Q5-6 (p. 13) : une métrique d'adresses uniques est manipulable par Sybil ; la mission (contrainte 4) ne l'exige pas ; ce G0 recommande de ne pas la rendre (T-7).
- Item PLAN-DOJO-ERRATA-1 (ligne datée par l'orchestrateur).

## 2. Ce que les lectures et les mesures établissent pour H1 à H4

Les cinq lectures ne donnent **aucune constante** : Wang Q5-1 (sections 2-3) ne mesure rien ; Liu Q5-9 (p. 3, p. 11-12) n'a ni données étiquetées ni taux d'erreur ; Messias Q3 ne mesure aucune parade. Les valeurs du seuil, de K et de l'âge minimal sont donc des décisions de l'investisseur, jamais un chiffre tiré de la littérature. Les mesures M1 à M3 (scripts hors dépôt, §14) sont de l'arithmétique sur des unités arbitraires ou du code du dépôt, sans donnée de marché.

| Hypothèse | Ce que disent les lectures (fichier, Q, page) | Mesure | Effet |
|---|---|---|---|
| H1, plafond | Liu Q5-3 (p. 1) : un plafond par adresse rend rentable le fractionnement d'un gros solde (application du lecteur, non mesurée) ; Messias Q5-3 (p. 13, p. 15-16) : des adresses multiples exploitent les plafonds, et un plafond par utilisateur suppose une identité ; Wang Q1 (p. 8) : aucun plafond dans le cadre f = w·t | M2 (A), T = 1 000 unités-jours, C = 100 par jour, 30 jours, B = 1 000 unités : plafond et droit binaire 1 droit sur une adresse contre 29 fractionné ; plafond et `floor(S/T)` 3 contre 30 ; sans plafond et `floor(S/T)` 30 dans les deux cas (0 violation de la sur-additivité de `floor` sur 40 000 couples) | Le plafond rend le fractionnement rentable ; son seul effet utile est une durée minimale T/C pour tous (M2 : 10 jours au lieu d'1 pour B = 10 T), qu'une condition d'âge explicite obtient sans prime au fractionnement |
| H1, remise à zéro | Messias Q5-9 (p. 6 ; p. 3, p. 8) : la vente ne se voit pas directement, une règle sur la baisse du solde frappe aussi les transferts entre ses propres adresses ; Wang Q5-6 (p. 14-15) : l'argument de liquidité va contre ; Wang Q5-7 (p. 6) : il faut une convention de lots | M2 (B) : soldes [100, 150, 100] : FIFO 250, LIFO 300, prorata 267, sans remise 350 ; [100, 0, 100] : 100 pour toute convention, 200 sans remise. M2 (C) : LIFO = somme des minima glissants, 0 écart sur 20 000 suites | LIFO se recompute depuis la seule série des valeurs journalières ; la règle porte sur la baisse, pas sur une « vente » |
| H1, départ | Wang Q5-2 (p. 6) : « In early-stage DAOs, where no participant has long holding periods yet, time-weighted voting offers limited protection. » ; Messias Q5-8 (p. 16) : le rétroactif est lui aussi anticipé, aucun choix n'est validé | — | Départ prospectif, déclaré ; l'engagement de graine impose un jour d'ancrage (D-4) |
| H2 | Messias Q5-7 (p. 14 ; p. 18-19) : un critère annoncé publiquement est exploité (Goodhart) ; Liu, point d'appui (p. 12, p. 8-9) : un ensemble éligible public permet l'audit par la foule ; Chalkias Q6-3 (p. 31) : une seule racine, vue identique pour tous | M2 (A) : sous un droit binaire le fractionnement multiplie les droits ; sous `floor(S/T)`, jamais | Seuil public (la recomputabilité l'exige), unité linéaire |
| H3 | Liu Q5-1 (p. 1, p. 4) : « une adresse = un score » avec seuil public est la condition par compte que règle le Sybil ; Liu Q5-11 (p. 4) : un utilisateur ordinaire a « only a few accounts » ; Lloyd Q5-4 (p. 5) : un intermédiaire = une adresse | floor(ΣS_i/T) − (k − 1) ≤ Σ floor(S_i/T) ≤ floor(ΣS_i/T) : borne haute vérifiée par M2 (0 violation), borne basse arithmétique (chaque arrondi perd moins d'une unité) | Sans agrégation, un détenteur à k adresses perd au plus k − 1 unités d'arrondi, jamais plus |
| H4 | Wang Q5-4 (p. 13, p. 16) : un snapshot ne capte qu'un état transitoire ; l'heure prévisible n'est pas traitée ; Lloyd Q6-1 (p. 1) : « voting weight (tokens) can be traded, and even borrowed for short terms. » ; Wang Q3 (p. 14) : un prêt éclair ne franchit pas un bloc établi | M2 (D) : à heure fixe, un solde emprunté autour de l'instant seulement reçoit le score d'un vrai détenteur (30 000 après 30 jours, égal). K lectures tirées au sort, minimum du jour : une présence sur une fraction f du jour passe les K lectures avec la probabilité f^K (f = 0,5 : 0,5 ; 0,25 ; 0,0625 ; 0,0039 pour K = 1, 2, 4, 8 ; f = 0,9 : 0,9 ; 0,81 ; 0,6561 ; 0,4305) | Heure fixe rejetée ; K lectures à instants engagés et révélés après coup |

**Verdict mesuré sur l'argument de la mission** (« fractionner n'apporte rien si le score est linéaire et le seuil unique par adresse ») : **faux** si le seuil ouvre un droit binaire par adresse (M2 : 1 000 unités, 30 jours, T = 1 000 unités-jours : 1 droit sur une adresse, 29 après fractionnement, avec ou sans plafond) ; **vrai** seulement si ce qui se compte est lui-même linéaire, `floor(score / T)` par adresse et sans plafond (30 dans tous les cas ; 0 violation de la sur-additivité sur 40 000 couples). La linéarité du score ne suffit pas : c'est la règle de droit qui décide.

## 3. Décisions

### D-1 : frontière de la pièce 1

- Dedans : collecteur, score, lignes, racine, chronologie signée, publication sur un hôte, vérificateur de lecteur, contrôle de conformité de l'hôte, synchro, données servies, page `/dojo`, entrée du registre Dōjō.
- Dehors : ce que le seuil ouvre (pièce 2) ; l'agent ; toute identité ; toute agrégation entre adresses ; les données premium ; le score continu par blocs (item DOJO-CONTINUOUS-1) ; tout historique antérieur à l'ancrage.

### D-2 : formule du score

- **Adresse** = le propriétaire (`owner`) des comptes de jetons du mint. Solde d'une adresse à une lecture = somme des montants de ses comptes de jetons du mint concordants à cette lecture (un portefeuille peut porter plusieurs comptes du même mint : c'est un regroupement de comptes sous un propriétaire, pas une agrégation de propriétaires).
- **Valeur du jour** m_d(a) = plus petit solde parmi les lectures concordantes du jour pour a. Aucune lecture concordante pour a ce jour ⇒ jour manquant pour a : ni contribution, ni remise à zéro ; les jours comptés sont ceux qui portent une valeur.
- **Lots LIFO** : pile de couples (montant, jour de naissance). Si m_d dépasse la somme de la pile, on empile (m_d − somme, d) ; si m_d est plus petit, on retire la différence depuis le lot le plus récent. Score au jour d = Σ montant × (nombre de jours comptés depuis la naissance, bornes incluses). C'est exactement Σ_τ min_{u ∈ [τ, d]} m_u sur les jours comptés (M2 (C)).
- **Aucun plafond.** Montants, scores et seuil sont des entiers décimaux en chaîne, calculés en BigInt. M1 : `canonical(2**53 + 1)` rend `9007199254740992` ; 10^15 unités de base tenues 10 jours donnent 10^16, au-delà de 2^53.
- **Unités** (si retenues, P-2) : `floor(score / seuil)` ; nulles tant que l'âge du plus ancien lot n'atteint pas l'âge minimal (P-2).
- **Adresse de programme** (D-6) : ligne publiée, pile vide, score et unités nuls.
- **Alternatives rejetées** : plafond (M2 : fractionnement rentable, ×10 à ×29 selon la règle) ; FIFO (250 contre 300 sur [100, 150, 100] : frappe d'abord les lots les plus anciens, ceux d'un détenteur de long terme qui cède une petite part) ; prorata (267, bookkeeping sans formule fermée) ; aucune remise à zéro (350 ; laisse transférer l'ancienneté entre adresses, T-5) ; somme des min(b, C) de H1 (ne remet rien à zéro : c'est un plafond sans remise).

### D-3 : seuil, unités, âge minimal

- Seuil T en unités de base × jours, décimal en chaîne, porté par chaque ligne `snapshot` avec `threshold_version` ; un changement vaut à partir du jour suivant la ligne qui le porte et ne recalcule jamais un jour passé ; rendu sur `/dojo` en jetons-jours par décalage décimal des `decimals` lus sur le mint, jamais tapé.
- Unité publiée, si l'investisseur la retient : `floor(score / T)` par adresse. Motif : Messias Q6-3 (p. 19) « rewards should scale with the actual costs incurred by users, ensuring a fairer and more effective distribution of incentives » ; le coût d'une unité est T jetons-jours, quelle que soit la façon de les répartir.
- Âge minimal N_min (jours comptés du plus ancien lot) : sans plafond, un détenteur de B ≥ T atteint T au premier jour (M2 : jour 1 pour B = 10 T) ; si l'investisseur veut une durée minimale pour tous, c'est cette condition, pas un plafond.
- Rang (top N) rejeté : il crée un tournoi et un coût d'accès mouvant ; Messias Q5-7 (p. 14) sur les métriques cibles.
- Valeurs de T et de N_min : investisseur (P-2).

### D-4 : lectures, graines, quorum

- **Chaîne de graines inverse** : secret opérateur s (`[masqué]`, jamais dans le dépôt) ; ancre a_0 = H^n(s) avec H = SHA-256 ; graine du jour d : g_d = H^(n−d)(s). Une ligne signée `anchor` publie a_0, le mint, le programme, K, n et le seuil initial **avant** le premier jour compté ; la ligne du jour d révèle g_d ; tout lecteur vérifie H^j(g_d) = graine révélée précédente, j = écart en jours. Avant sa révélation, g_d est une préimage de la dernière graine publiée : le public ne peut pas calculer les instants du jour d. Horizon n : P-21 (épuisé, une nouvelle ligne `anchor`).
- **Instants** : t_{d,i} = début du jour d UTC + (valeur entière de H(g_d ‖ "dojo-read" ‖ i) modulo 86 400) secondes, i = 1..K, triés.
- **Contrôle du mint**, une fois par jour : `getAccountInfo` `jsonParsed` sous quorum et `readMintToken2022` (`supply.ts:62-77`) ; un changement de programme, de décimales ou d'extension (délégué permanent, pause, multiplicateur d'affichage, et toute extension non prévue) ⇒ le jour s'abstient et la ligne le dit (T-11).
- **Énumération** (D-5) sur deux opérateurs distincts, engagement `finalized` (Wang Q3, p. 14 : « the snapshots are taken only for the established blocks and would not consider the current flash loan »).
- **Quorum par compte de jetons** : (compte, propriétaire, montant) identiques chez les deux ⇒ concordant ; sinon le compte est sans quorum à cette lecture : ni baisse, ni présence. Essais bornés quand la part sans quorum dépasse une borne (valeurs au G1, déclarées).
- **Ce que la ligne signée porte par lecture** : l'instant tiré, l'heure UTC de la machine qui lit, les deux emplacements (`slot`) de contexte, le nombre de comptes concordants et sans quorum ; jamais un libellé d'opérateur (motif `bell-served-load.ts:7-8`).
- **Résiduel** : l'opérateur connaît s, donc les instants (T-10) ; accepté ou recherche DOJO-RANDOMNESS-1 (P-4).
- **Alternatives** : heure fixe (M2 (D) : score plein pour un emprunt) ; une seule lecture tirée (f^1) ; score continu par blocs (coût proportionnel à l'activité A, inconnue ; complétude non confirmée) ; mélange d'une valeur publique future (item de recherche).

### D-5 : énumération des comptes de jetons

- Requête : `getProgramAccounts` sur `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` (constante déjà committée, `apps/bell/src/pools.ts:69`), filtre `memcmp` sur le mint à l'offset du champ mint, `withContext`, `jsonParsed`. Offset, forme de réponse et prise en charge de `withContext` : **NON CONFIRMÉS** (FAITS-SOLANA-PDA-TOKEN2022-1, SNAPSHOT-PROBE-1).
- Opérateurs : `helius` (10 crédits par appel, M1) et `solana-foundation` (0 crédit ; acceptation de la méthode et limites NON CONFIRMÉES : FAITS-SOLANA-PUBLIC-RPC-TERMS-1). `chainstack` écarté tant que sa table fermée refuse la méthode (M1) ; l'y admettre = ligne d'ADR et lecture sur place de son barème (CHAINSTACK-GPA-TARIFF-1).
- Méthodes du lot : `DOJO_SOLANA_METHODS = ["getAccountInfo", "getProgramAccounts"]`, plafonnées à la construction (`assertMethodCapsCover`) ; budget `--max-calls` et `--max-credits` tous deux obligatoires, fail-closed (Bell n'exige que le premier : `collect.ts:487`, `:502`).
- Coût Helius : 10·K + 1 crédits par jour hors essais (K = 4 : 41 par jour, 1 230 sur 30 jours), à comparer au plafond interne de cycle de 8 M crédits (FAITS Helius l.6, décision 112 ; durée du cycle non relue ici).
- **Rejetés** : `getTokenAccountsByOwner` (prend un propriétaire en paramètre, emploi du dépôt : `apps/bell/src/pools.ts:116`, « getTokenAccountsByOwner(poolId) » : il relit un détenteur connu, il n'en découvre pas ; admis plus tard pour une relecture ciblée) ; `getTokenLargestAccounts` (refusé par les deux tables, M1 ; ne rend que les plus gros comptes, limite NON CONFIRMÉE ici) ; `getTokenAccounts` de l'API DAS (Helius seul : aucun second opérateur distinct, donc pas de quorum) ; reconstruction par l'historique complet (item DOJO-CONTINUOUS-1).

### D-6 : exclusion des adresses de programme

- Règle : propriétaire dont les 32 octets ne décodent pas un point de la courbe Ed25519 ⇒ classe `program`, score nul ; sinon classe `holder`. Fonction pure (décompression par BigInt, une vingtaine de lignes, aucune dépendance), appelée par le collecteur, l'éditeur, le vérificateur et les tests.
- M3 : créateur `BQPs…3QV` sur la courbe ; courbe de liaison `2v82…m6F`, compte associé `6tW6…YWo` et pool `GhCG…hvg` hors courbe, comme leurs rôles [2nd] le laissent attendre ; `node:crypto` accepte à l'import un codage hors courbe (y = 2) : aucun oracle intégré, d'où le code propre (R-8 évité).
- Le contrat de verrou `63dK…1Pn` est sur la courbe : ce qui compte est le propriétaire du compte de jetons qui porte le verrou, inconnu sans sonde (SNAPSHOT-PROBE-1 (b)).
- Que toute détention contrôlée par un programme ait un propriétaire hors courbe : **NON CONFIRMÉ** (FAITS-SOLANA-PDA-TOKEN2022-1).
- Résiduel : un portefeuille de plateforme d'échange ou de garde est sur la courbe et compte pour un détenteur (Lloyd Q5-4, p. 5 ; Liu Q5-6, p. 7, retire ces adresses par liste).
- **Alternatives** : propriétaire du propriétaire lu en RPC (`discover.ts:143-172` : non recomputable hors ligne ; `unread` ambigu pour un propriétaire sans compte, portefeuille sans SOL compris, non confirmé) ; liste committée de pools et de contrats (fragile ; Liu Q5-8, p. 12 : importer la liste d'un autre projet est « inappropriate ») ; aucune exclusion (Lloyd Q6-3, p. 5 : « All of this voting activity appears as a single address when analysing Curve in isolation. »).

### D-7 : lignes, racine, preuve

- **Ligne** (clés fermées) : `{address, class, reads, day_value, lots, score}` plus `units` si P-2 le retient ; `reads` = K montants ou `null` (sans quorum) ; `day_value` = décimal ou `null` ; `lots` = liste de `[montant, jour]`. JSON canonique de Bell (`canonical`, clés triées). Lignes triées par `address` en ordre d'octets. Fichier = lignes avec LF, servi à `lines/<sha256>.jsonl`, immuable.
- **Existence d'une ligne** : dès qu'une lecture du jour est positive ou que la pile de la veille n'est pas vide ; une adresse sortie garde une ligne à score nul le jour de sa sortie, pour que l'omission se voie (mutant M-2).
- **Taille (M3)** : 223 octets par ligne pour K = 1, 280 pour K = 4 ; par jour à K = 4 : 273 Kio pour N = 10^3, 2,67 Mio pour 10^4, 26,7 Mio pour 10^5. N NON CONFIRMÉ (sonde).
- **Arbre de Merkle** : feuille = SHA-256(0x00 ‖ octets de la ligne sans LF) ; nœud = SHA-256(0x01 ‖ gauche ‖ droite) ; coupe à la plus grande puissance de deux strictement inférieure au compte, sans dupliquer de feuille : structure de RFC 6962 §2.1, non relue ici, à lire avant le G1 (FAITS-RFC6962-1). Chemin : 10, 14 et 17 frères pour N = 10^3, 10^4, 10^5 (320, 448 et 544 octets bruts, M3).
- Une seule racine par jour, portée par la ligne signée (Chalkias Q6-3, p. 31 : « publishing only one root node to ensure every user has exactly the same view of the reported proof of liabilities commitment ») ; placement déterministe des feuilles, ici par l'adresse, unique (Chalkias Q5-10, p. 11, p. 32-33) ; le pseudo-code du papier n'est pas une référence d'implémentation (Chalkias Q5-8, p. 26-29, p. 47) : la spécification vient du RFC et les tests recodent l'arbre indépendamment.
- DAPOL exclu (décision de l'orchestrateur en fin de la lecture Chalkias : soldes publics, recomputation publique). La proposition du plan « personne ne voit celle des autres si on le veut » (plan §1.3) est sans objet : tout est public, fuite acceptée par conception (même décision).
- **Rejetés** : arbre à somme ; fichiers de preuve par ligne (N fichiers par jour) ; duplication de la dernière feuille.

### D-8 : chaîne et clé

- **Ligne de chronologie** (clés fermées) `{schema: "dojo-timeline-v1", seq, kind, prev_line_hash, key_id, published_at, sig, ...}` ; `kind` ∈ {`anchor`, `snapshot`, `key_rotation`, `key_revocation`}. Une ligne `anchor` porte `seed_anchor`, `mint`, `program`, `k_reads`, `horizon`, `threshold`, `threshold_version`. Une ligne `snapshot` porte `day`, `seed`, `reads` (§D-4), `mint`, `decimals`, `threshold`, `threshold_version`, `lines_sha256`, `lines_count`, `root`, `score_total`, `status` (`counted` ou `abstained` avec motif).
- **Marcheur** `walkDojoTimeline(lines, trust)` : calque déclaré de `walkTimeline` (même ordre de contrôles, même calendrier de clés), plus : `day` strictement croissant, graine chaînée, première ligne `anchor`, aucune ligne `snapshot` pour un jour antérieur à l'ancre, aucune graine révélée avant la fin de son jour. Imports depuis `../../bell/scripts/bell-chain.mjs` sans modification : `canonical`, `lineHash`, `verifyLine`, `trustOf`, `publicKeyOfJwk`, `GENESIS` (précédent de calque déclaré et prouvé égal par test : `bell-chain.mjs:1-7`).
- **Équivalence prouvée** : sur un corpus de chronologies Bell signées par une clé générée à l'exécution, `walkDojoTimeline` après renommage du schéma et des types rend le même verdict que `walkTimeline` (ok, `reason`, `seq`).
- **Clé** : distincte de celle de Bell, générée sur l'hôte par l'orchestrateur (procédure de `RUNBOOK-bell.md:125-138`) ; trousseau public committé `apps/dojo/keys/dojo-keyring.json`, racine de confiance du vérificateur (motif C-9). La clé de Bell n'est jamais réutilisée (mission, contrainte 5).
- **Alternative rejetée** : paramétrer `walkTimeline` dans `bell-chain.mjs` (redéploiement et CA de Bell pour un lot Dōjō, §1.4).

### D-9 : hôte

| Option | Pour | Contre | Verdict |
|---|---|---|---|
| Hôte Bell `178.16.131.29`, unité `monark-dojo-publish.service` hors réseau, utilisateur `dojo`, `/var/lib/monark-dojo/public`, `/etc/monark/dojo/signing-key.pem`, nom `dojo.monarkgate.tech` | reprend le patron durci de Bell (hors réseau, modules intégrés, CA à contrôles nommés) ; aucune clé sur le serveur public du site | deux clés dans les mêmes sauvegardes du fournisseur (ESC-2 étendu : un événement d'exposition fait tourner les deux) ; la CA de Bell (contrôles 11 et 12) et son Caddyfile doivent être amendés ; une compromission root de l'hôte expose les deux clés | **recommandé** (P-7) |
| VPS du site `31.97.155.188` | déjà une tâche quotidienne à RPC sortant (sentinelle) ; sert déjà des fichiers statiques sous `monarkgate.tech` | serveur Next public, harnais, tâche réseau : surface plus large pour une clé ; aucune clé de signature n'y vit aujourd'hui | rejeté pour la clé |
| Nouveau petit VPS | isolation complète | coût non lu ; nouvelle procédure, nouvelle CA, nouveau fournisseur de sauvegardes à lire | alternative (P-7) |
| Machine opérateur | aucun hôte nouveau | clé là où tournent les agents ; contraire à la doctrine de Bell (`RUNBOOK-bell.md:57-65`) | rejeté |

Disposition servie sur l'hôte retenu : `/timeline.jsonl`, `/dojo/pubkey.json`, `/lines/<sha256>.jsonl` ; en-têtes `immutable` sur `lines/`, `no-cache` sur la chronologie ; aucun listage (motif des contrôles 7 et 8 de Bell, `RUNBOOK-bell.md:322-340`).

### D-10 : vérificateur de lecteur

- CLI `node dojo-verify.mjs (--url <base> | --dir <dir>) --keyring <fichier> [--address <adresse>] [--day <jour>]`, modules intégrés seuls, sources et bornes comme `bell-verify.mjs` (l.30-68).
- Il marche la chronologie sous le trousseau fourni ; vérifie la chaîne de graines depuis l'ancre et les instants tirés ; pour chaque ligne `snapshot` demandée : sha256 et compte du fichier de lignes, tri, clés fermées, classe (courbe), transition des lots depuis le fichier de la veille, valeur du jour, score, unités, seuil, racine ; avec `--address`, imprime la ligne et sa preuve d'inclusion et la vérifie contre la racine signée.
- Codes de refus, liste fermée : `insecure_url`, `redirect_refused`, `http_status`, `unreachable`, `too_large`, `not_json`, `keyring_invalid`, `served_key_not_in_keyring`, `timeline_malformed`, `chain_broken`, `key_not_in_keyring`, `signature_invalid`, `key_not_active`, `rotation_malformed`, `revocation_malformed`, `anchor_missing`, `day_not_increasing`, `seed_chain_broken`, `seed_revealed_early`, `read_instant_mismatch`, `lines_sha_mismatch`, `lines_count_mismatch`, `lines_not_sorted`, `line_malformed`, `line_missing`, `class_mismatch`, `program_address_scored`, `lots_transition_mismatch`, `score_mismatch`, `units_mismatch`, `threshold_mismatch`, `root_mismatch`, `proof_invalid`.
- Rapport : `consistent_with_supplied_keyring` ou `self_consistent_only` (motif Bell) et la portée « a signature attests origin, never truth; the readings are what two operators reported ». Ce qu'il ne vérifie pas : les soldes contre la chaîne (Chalkias Q5-6, p. 16 : les litiges ne se tranchent pas cryptographiquement ; ici chaque détenteur contrôle sa ligne contre son propre historique public).

### D-11 : site

- `scripts/sync-dojo-served.mjs` (outil du dépôt source, non exporté) : GET des corps servis, marche sous le trousseau committé, recalcul de la racine de la tête, liaison au contrôle de déploiement committé `docs/deploy-CA-dojo.json`, écriture de `apps/site/data/dojo-served.json` et de son entrée de manifeste (`setManifestEntry`), et du `$comment` du manifeste.
- `apps/site/lib/dojo-served-load.ts` : projection pure `buildDojoServed(input, deps)` (fonctions de chaîne injectées, motif `bell-served-load.ts:478`) et chargeur `loadDojoServed` fail-closed (sha256, forme fermée) ; aucun alias, modules intégrés seuls.
- Données servies (clés fermées) : `host`, `read_at`, `timeline` (lignes, snapshots), `head` (`seq`, `day`, `status`, `lines_count`, `root`, `lines_sha256`, `score_total`, `threshold`, `threshold_version`, `decimals`, `k_reads`, `slot_min`, `slot_max`, `line_hash`, `key_id`, `published_at`), `keyring`, `deploy_check`, `bodies_sha256`.
- Page `apps/site/app/dojo/page.tsx` : textes du §8, valeurs par accès de propriété ; publiée seulement quand une tête `snapshot` est servie (P-10).
- Registre : module distinct `apps/site/lib/dojo-register.ts` : un programme « MONARK Dōjō » et une pièce `hold-snapshot`, statut `upcoming` puis `built` avec `served` (chemin servi, tests d'intégration, note sans chiffre) ; ni `role`, ni câblage capteur, porte, acte : aucun composant de la flotte ou des applications ne peut le rendre. `fleet.ts` et son test de gel ne changent pas (onze agents, six applications).
- `scripts/assert-fleet-html.mjs` étendu : `assertDojoBody({html, expected})` lit le `<main>` rendu de `/dojo` ; liste fermée des chiffres (jour, `slot_min`, `slot_max`, `lines_count`, racine, seuil en jetons-jours, `score_total`, `k_reads`), chacun exactement une fois ; aucun autre chiffre ; phrase de bornes présente ; lexique interdit absent (§8).

### D-15 : anti-close et secrets

- **Aucun prix** : les clés d'une ligne et d'une ligne de chronologie sont fermées ; aucun prix, aucune valeur en monnaie, aucune capitalisation ; en défense, l'éditeur applique `assertNoCloseLike` de `bell-chain.mjs` (l.43-47) à chaque ligne (mutant M-E2). Les chiffres de marché lus à l'écran ne sont jamais réutilisés comme faits (règle 2026-09-20).
- **Aucune clé, aucune graine non révélée dans le dépôt** : clé Dōjō sur l'hôte seul (D-8) ; secret de graines hors dépôt (TU-2) ; test `dojo_no_secret_in_repo` (calque de `bell_no_secret_in_repo`, rappelé par `apps/bell/src/pools.ts:9-11`) ; toute valeur non publique écrite dans un document prend `[masqué]`.
- **A-7** : toute commande de gate et toute lecture du collecteur tournent sous `env -u` des huit variables payantes, un seul `sh -c` englobant (motif `RUNBOOK-bell.md:342-352`) ; le collecteur ne lit les clés qu'à travers `openGuardedClient` ; jamais `env` affiché ; jamais la clé affichée, copiée ni hachée (liste « Never » de `RUNBOOK-bell.md:501-508`, reprise mot pour mot par RUNBOOK-dojo).
- **Aucun fournisseur servi** : ni libellé d'opérateur, ni URL, ni nom de plateforme dans un fichier servi, dans `dojo-served.json` ou sur `/dojo` (portes du §1.5 ; mutants M-E3, M-P6).

## 4. Registre des menaces T (forme retenue de l'audit Vernier : menace, mécanisme, parade, statut)

| # | Menace | Mécanisme | Parade | Statut | Lecture (fichier, Q, page) |
|---|---|---|---|---|---|
| T-1 | Fractionnement | répartir un solde sur k adresses chacune au-dessus du seuil | unités `floor(S/T)` par adresse, sans plafond : le fractionnement n'ajoute jamais d'unité (M2 : 0 violation ; 29 contre 1 sous H1) | neutralisé par construction si P-1 et P-2 retenus ; sinon ouvert | Liu Q5-1 (p. 1, p. 4), Q6-1 (p. 4) : « Sybils tend to create multiple accounts and manipulate each account's activities for airdrop qualification, aiming at obtaining more issued tokens. » ; Messias Q5-3, Q5-4 (p. 13) |
| T-2 | Emprunt à l'instant du snapshot | acheter ou emprunter juste avant une heure connue, rendre après | K lectures à instants engagés et révélés après coup ; valeur du jour = minimum ; remise à zéro LIFO (f^K, M2) | réduit et chiffré ; résiduel initié (T-10) | Wang Q5-4 (p. 13, p. 16) ; Lloyd Q6-1 (p. 1) |
| T-3 | Prêt éclair | solde gonflé dans une transaction | lecture `finalized` : un prêt éclair ne franchit pas un bloc établi | neutralisé par construction | Wang Q3 (p. 14) |
| T-4 | Enveloppes, intermédiaires, pools | un coffre de pool ou un contrat apparaît comme un détenteur | propriétaire hors courbe ⇒ `program`, score nul (D-6) ; portefeuilles de plateformes comptés pour un | réduit ; résiduel déclaré (garde, plateformes) | Lloyd Q5-3 (p. 3), Q5-4 et Q6-3 (p. 5) ; Liu Q5-6 (p. 7) |
| T-5 | Wash de soldes entre adresses | faire circuler un même solde pour vieillir plusieurs adresses | toute baisse remet à zéro la part sortie ; la part reçue naît à zéro (M2 (B) : [100, 0, 100] donne 100, contre 200 sans remise) | neutralisé pour le transfert d'ancienneté ; coût déclaré : un déplacement légitime entre ses propres portefeuilles remet aussi à zéro | Messias Q5-9 (p. 6 ; p. 3, p. 8) |
| T-6 | Location ou vente d'adresses qualifiées | le contrôle d'une adresse se négocie hors chaîne | aucune dans la pièce 1 (invisible sur la chaîne) ; la pièce 2 liera le droit à une signature de l'adresse et le rendra non transférable | ouvert, item DOJO-P2-RIGHT-BINDING-1 | Lloyd Q5-5 (p. 5, p. 8 : 248 millions USD de pots-de-vin, corrélation 0,99, causalité non établie) ; Messias Q5-11 (p. 17) |
| T-7 | Nombre de détenteurs publié comme cible | compter des adresses uniques, gonflable par fractionnement | ne pas rendre de compte « au-dessus du seuil » ; rendre `score_total`, invariant au fractionnement ; les lignes restent publiques (fuite acceptée) | réduit ; accepté par conception | Messias Q5-6 (p. 13), Q5-7 (p. 14, p. 18-19) ; Chalkias Q5-5 (p. 5, 8, 15, 16) et décision de l'orchestrateur |
| T-8 | Tiers de confiance | MONARK produit le snapshot | quorum de deux opérateurs, chronologie signée et chaînée, lignes publiques, vérificateur indépendant, une seule racine | réduit ; résiduel : les soldes sont la lecture de MONARK, contrôlables par chaque détenteur sur son historique | Wang Q5-5 (p. 5) ; Chalkias Q6-2 (p. 15), Q4 (p. 15-16, p. 37), Q6-3 (p. 31) |
| T-9 | Omission ou insertion de lignes par l'éditeur | taire une adresse ou ajouter une ligne fictive | compte et racine signés ; toute adresse de la veille a une ligne (M-2) ; une ligne fictive contredit la chaîne aux emplacements publiés | réduit ; une omission d'adresse nouvelle et une ligne fictive ne se voient qu'avec une lecture de la chaîne | Chalkias Q2 (p. 37), Q5-1 (résumé) |
| T-10 | Initié | l'opérateur connaît les instants avant le public | graines engagées par l'ancre (pas de choix après coup) ; lectures datées et publiées | résiduel déclaré ; recherche DOJO-RANDOMNESS-1 | aucune lecture ne le traite (Wang Q5-4 : heure prévisible NON TRAITÉE) |
| T-11 | Extensions du mint | un délégué permanent déplace des soldes ; un multiplicateur change l'unité ; une pause fige | contrôle quotidien du mint ; tout changement ⇒ jour abstenu | à mesurer (sonde) | aucune lecture ; `DOSSIER:75-84` [2nd] |
| T-12 | Opérateur en panne ou en désaccord | une seule réponse, ou deux différentes | quorum par compte ; jamais une lecture mono-opérateur publiée comme concordante | neutralisé par construction | modèle Bell (`quorum.ts:89-122`) |
| T-13 | Premier jour | au départ toutes les durées sont nulles ; sans plafond un gros détenteur atteint T au jour ⌈T/B⌉ | âge minimal N_min (P-2) | décision investisseur | Wang Q5-2 (p. 6) |
| T-14 | Enracinement | les premiers détenteurs accumulent sans fin | aucune décroissance proposée dans la pièce 1 ; question ouverte | décision investisseur (P-1) | Wang Q5-3 (p. 5-6) |

## 5. Tuyaux (ADR-M018 D3)

| # | Entrée (qui produit) | Sortie (qui consomme) | État (où il vit) | Test non-LLM | Au 2026-09-25 |
|---|---|---|---|---|---|
| TU-1 | chaîne Solana lue par deux opérateurs via `openGuardedClient` (collecteur, machine opérateur) | paquet du jour (lectures concordantes, graine du jour tenue secrète jusqu'à la fin du jour) | `F:/PRODUITS/dojo-mirror/bundles/` hors dépôt, durable | `dojo_collect_reads_quorum_per_account` sur appel injecté hors ligne ; première main : SNAPSHOT-PROBE-1 | absent |
| TU-2 | secret de l'opérateur | ancre, graines, instants | `F:/PRODUITS/dojo-mirror/seed/` hors dépôt, `[masqué]`, jamais servi avant révélation | `dojo_collect_instants_follow_the_seed_chain` ; `dojo_verify_refuses_each_named_mutant` (M-9) | absent |
| TU-3 | `out/mint.txt` épinglé | mint du collecteur | dépôt | `dojo_mint_is_the_pinned_ca` (égalité avec `token_ca_pinned`) | absent |
| TU-4 | paquet → boîte d'entrée de l'hôte (acte orchestrateur) → éditeur | `timeline.jsonl`, `lines/<sha256>.jsonl`, `dojo/pubkey.json` signés | `/var/lib/monark-dojo/public` sur l'hôte | `dojo_publish_to_verify_end_to_end` (fixture, clé générée à l'exécution) | absent |
| TU-5 | fichiers servis | vérification du tiers (`dojo-verify.mjs`) | aucun | `dojo_verify_accepts_a_signed_served_fixture`, M-1 à M-12 | absent |
| TU-6 | fichiers servis + capture de l'hôte | `docs/deploy-CA-dojo.json` | dépôt (committé) | `verify_dojo_ca_runs_real_dojo_verify` | absent |
| TU-7 | fichiers servis + CA committée → `sync-dojo-served.mjs` | `apps/site/data/dojo-served.json` + manifeste | dépôt (committé, haché) | `dojo_served_data_matches_deploy_ca`, `dojo_served_loader_is_fail_closed` | absent |
| TU-8 | données servies → chargeur | phrases et chiffres de `/dojo` | build | `dojo_snapshot_composes_served_lines_to_page_figures` (racine et scores recodés dans le test) ; `assertDojoBody` sur le HTML construit (job `g3-site`) | absent |
| TU-9 | registre Dōjō | statut de `/dojo` | `apps/site/lib/dojo-register.ts` | `dojo_register_is_frozen` | absent |
| TU-10 | export | miroir public (vérificateur, trousseau, chaîne, éditeur, CA, site) | historique du miroir | `export:check`, `dojo_export_ships_the_verifier_and_the_keyring` | absent |

**Règle Branchement** : la pièce reste `upcoming` au registre Dōjō tant que TU-1 à TU-8 ne sont pas servis et que `dojo_snapshot_composes_served_lines_to_page_figures` et `dojo_served_data_matches_deploy_ca` ne sont pas verts sur les données réelles ; le passage à `built` est un acte T2 sur décision de l'investisseur (précédent : décision 155 pour Bell). Un tuyau absent au G7 d'une PR qui l'annonce = item formé avec déclencheur.

## 6. Tâches, tests nommés, mutants

Tests non-LLM (`npm test`), mutants appliqués sur copie, restaurés au sha256, jamais dans l'index du dépôt ; aucun test n'appelle le réseau ; aucune clé committée (clés de test générées à l'exécution, motif `test/bell-served.test.ts:314-315`).

### PR-1a : noyau pur (score, courbe, Merkle)

- **T-1 score** — `apps/dojo/scripts/dojo-core.mjs` (+ `.d.mts`) : `dayValue`, `stepLots`, `scoreOf`, `unitsOf`, âge. Tests : `dojo_score_is_the_lifo_running_minimum` (oracle recodé dans le test : somme des minima glissants sur suites pseudo-aléatoires déterministes) ; `dojo_units_never_rise_by_splitting` (grille exhaustive, plus les contre-exemples de M2) ; `dojo_missing_day_neither_counts_nor_resets`. Mutants : **M-S1** FIFO au lieu de LIFO ; **M-S2** aucune remise à zéro ; **M-S3** arithmétique en nombre JavaScript (fixture à 2^53 + 1) ; **M-S4** plafond réintroduit ; **M-S5** droit binaire (1 si S ≥ T) ; **M-S6** jour manquant traité comme une baisse.
- **T-2 courbe** — même module : `base58Decode`, `ed25519OnCurve`, `ownerClass`. Test `dojo_owner_class_is_the_ed25519_curve_test` : point de base (sur la courbe), y = 2 (hors), codage non canonique y ≥ p (refusé), adresses de contrôle du §3 D-6. Mutants : **M-C1** toujours sur la courbe ; **M-C2** y ≥ p accepté.
- **T-3 Merkle** — même module : `leafHash`, `nodeHash`, `rootOf`, `proofOf`, `verifyProof`. Test `dojo_merkle_root_and_proofs` : toutes les preuves de n = 1 à 33, racine recodée dans le test, vecteurs de RFC 6962 si FAITS-RFC6962-1 en fournit. Mutants : **M-M1** sans préfixes de domaine (seconde préimage : une feuille de 64 octets égale à la concaténation de deux nœuds donne la même racine) ; **M-M2** duplication de la dernière feuille pour n impair.
- **T-4 espace de travail** — `apps/dojo/package.json`, motif de test dans `package.json` (`"apps/dojo/test/*.test.ts"`), `tsconfig.json` (`apps/dojo/src/**`, `apps/dojo/test/**`).

### PR-1b : chaîne et vérificateur

- **T-5 chaîne** — `apps/dojo/scripts/dojo-chain.mjs` (+ `.d.mts`) : `walkDojoTimeline`. Test `dojo_walk_matches_bell_walk_on_renamed_corpus`. Mutant : **M-K1** ordre des contrôles changé (signature avant chaîne : autre `reason`).
- **T-6 vérificateur** — `apps/dojo/scripts/dojo-verify.mjs` (+ `.d.mts`), `apps/dojo/test/helpers/dojo-fixture.ts` (arbre servi signé par une clé générée à l'exécution). Tests : `dojo_verify_accepts_a_signed_served_fixture` ; `dojo_verify_cli_is_fail_closed` (usage, drapeaux orphelins, `self_consistent_only` sans trousseau) ; `dojo_verify_refuses_each_named_mutant`, avec les mutants exigés par la mission et quatre de plus :
  - **M-1** score tapé (+1 sur une ligne) ⇒ `score_mismatch` ;
  - **M-2** ligne omise (adresse de la veille absente ; compte et racine recalculés et resignés par la clé de test) ⇒ `line_missing` ;
  - **M-3** racine recalculée sur lignes réordonnées et resignée ⇒ `lines_not_sorted` puis `root_mismatch` ;
  - **M-4** seuil changé sans changement de version, ou appliqué rétroactivement ⇒ `threshold_mismatch` ;
  - **M-5** solde d'un compte de programme compté (propriétaire hors courbe avec score non nul) ⇒ `program_address_scored` ;
  - **M-6** chaîne cassée (`prev_line_hash` altéré) ⇒ `chain_broken` ;
  - **M-7** signature d'une autre clé ⇒ `key_not_in_keyring` ou `signature_invalid` ;
  - **M-8** snapshot rejoué avec un autre slot (lignes de la veille republiées sous un autre jour ou d'autres emplacements, ou second `snapshot` pour un même jour) ⇒ `day_not_increasing` ou `read_instant_mismatch` ;
  - **M-9** graine incohérente (H(g_d) différent de la graine précédente) ⇒ `seed_chain_broken` ;
  - **M-10** pile de lots qui ne découle pas de la veille ⇒ `lots_transition_mismatch` ;
  - **M-11** chemin d'inclusion altéré ⇒ `proof_invalid` ;
  - **M-12** graine d'un jour révélée avant la fin de ce jour ⇒ `seed_revealed_early`.

### PR-2 : collecteur (après SNAPSHOT-PROBE-1)

- **T-7** — `apps/dojo/src/collect.ts` : contrôle du mint (`readMintToken2022` importé), énumération sous `quorum2` importé de `apps/bell/src/quorum.ts` (import entre applications, précédent : Bell importe `providerOf` de la sentinelle, `quorum.ts:15`), quorum par compte, essais bornés, instants, paquet ; budget obligatoire ; mint lu de `out/mint.txt`. **T-8** — `DOJO_SOLANA_METHODS` et plafonds. Tests : `dojo_collect_reads_quorum_per_account`, `dojo_collect_abstains_on_mint_change`, `dojo_collect_instants_follow_the_seed_chain`, `dojo_collect_budget_stops_fail_closed`, `dojo_mint_is_the_pinned_ca`, `dojo_bundle_carries_no_operator_label_and_no_secret`. Fixtures de réponses : dérivées des réponses brutes de la sonde (hors dépôt, sha256 consignés), déclarées. Mutants : **M-Q1** un seul opérateur accepté comme quorum ; **M-Q2** désaccord compté comme baisse ; **M-Q3** engagement autre que `finalized` ; **M-Q4** changement d'extension ignoré ; **M-Q5** graine d'un jour futur écrite dans le paquet ; **M-Q6** mint en littéral au lieu de `out/mint.txt`.

### PR-3a : éditeur

- **T-9** — `apps/dojo/scripts/dojo-publish.mjs` (+ `.d.mts`) : un seul paquet en boîte d'entrée, validation, lignes du jour calculées depuis le fichier de la veille, fichiers immuables écrits avant la ligne, ligne signée ajoutée, `--generate-key` (JWK publique et `key_id` seuls, refus d'écraser). Tests : `dojo_publish_writes_immutables_before_the_line`, `dojo_publish_refuses_a_malformed_bundle` (refus nommés), `dojo_publish_same_bundle_twice_publishes_nothing`, `dojo_publish_to_verify_end_to_end`, `dojo_generate_key_prints_no_private_member`. Mutants : **M-E1** ligne écrite avant les immuables ; **M-E2** champ de prix accepté dans une ligne ; **M-E3** libellé d'opérateur servi.

### PR-3b : hôte, CA, export

- **T-10** — `deploy/monark-dojo-publish.service` (utilisateur `dojo`, `PrivateNetwork=yes`, `LoadCredential=dojo-signing-key:/etc/monark/dojo/signing-key.pem`, `ReadWritePaths=/var/lib/monark-dojo`) ; `deploy/Caddyfile.monark-dojo` ; `scripts/verify-dojo.mjs` (+ `.d.mts`) ; lignes d'export (fichier par fichier, motif `export-public.mjs:94-108`) ; `docs/RUNBOOK-dojo.md` (hors R-25). Tests : `verify_dojo_ca_runs_real_dojo_verify`, `dojo_unit_is_offline_and_loads_its_own_credential`, `dojo_export_ships_the_verifier_and_the_keyring`. Mutants : **M-H1** l'unité charge le chemin de la clé Bell ; **M-H2** réseau permis à l'unité ; **M-H3** vérificateur absent de l'export.

### PR-4a : données servies

- **T-11** — `apps/site/lib/dojo-served-load.ts`, `scripts/sync-dojo-served.mjs`, `apps/site/data/dojo-served.json` (régénéré par acte de l'orchestrateur, précédent décision 215), `apps/site/data/manifest.sha256.json` (entrée et `$comment`). Tests : `dojo_served_loader_is_fail_closed`, `dojo_snapshot_composes_served_lines_to_page_figures` (fixture servie signée → `buildDojoServed` → chiffres de la page, racine et scores recodés dans le test), `dojo_served_data_matches_deploy_ca`. Mutants : **M-P5** chargeur sans contrôle de sha256 ; **M-P6** synchro qui garde un libellé d'opérateur ; **M-P7** données liées à une CA périmée.

### PR-4b : page, registre, assertion du rendu

- **T-12** — `apps/site/app/dojo/page.tsx` (+ composant), `apps/site/lib/dojo-register.ts`, extension de `scripts/assert-fleet-html.mjs` (+ `.d.mts`), lien depuis `/token` (P-11), `apps/site/COMPONENTS-PROVENANCE.md`. Tests : `dojo_register_is_frozen` (construit ⇔ chemin servi et tests d'intégration existants sous les racines de câblage, `test/ci-gates.test.ts:925-940` ; note sans chiffre), `dojo_page_renders_served_figures_only` (pilote de `assertDojoBody` sur HTML synthétique), `dojo_page_lexicon_is_closed` ; portes existantes (vocabulaire, cuisine, opérateurs, chiffres). Mutants : **M-P1** chiffre tapé en source ; **M-P2** racine d'un autre jour rendue ; **M-P3** « agent » sur `/dojo` ; **M-P4** statut `built` sans chemin servi ; **M-P8** phrase de bornes retirée.

## 7. Série de PR, ordre des gates, R-25

**Méthode d'estimation** : ascendante, sans code écrit ; puis corrigée par la dérive mesurée sur les lots Bell du même dépôt : PR-A 431 lignes pour 230-280 estimées (×1,54 à ×1,87) ; PR-B1 321 pour ≈ 176 (×1,82) ; PR-B2 668 pour ≈ 406 (×1,65) ; lot PR-B 1 015 pour ≈ 582 (×1,74) (`docs/adr/ADR-BELL-OTS-ANCHOR-1.md:388-390`, `docs/adr/ADR-BELL-OTS-PRB.md:218`, `:473`). Facteur de planification ×1,7 ; facteur de pire cas ×2,0. Borne CI 1 205 (`.github/workflows/ci.yml:49`), seuil STOP 1 150 (ADR-BELL-OTS-ANCHOR-1 l.270). `docs/**/*.md` exclu (`ci.yml:82`) ; `apps/dojo/test/fixtures/**` compté (non exclu).

| PR | Contenu | Estimation ascendante | ×1,7 | ×2,0 | Régime |
|---|---|---|---|---|---|
| PR-1a | noyau pur (score, courbe, Merkle), espace de travail | 336 | 571 | 672 | complet |
| PR-1b | chaîne, vérificateur, fixture signée, M-1 à M-12 | 544 | 925 | 1 088 | complet |
| PR-2 | collecteur, méthodes, plafonds | 480 | 816 | 960 | complet |
| PR-3a | éditeur | 392 | 666 | 784 | complet |
| PR-3b | unité, Caddy, CA, export | 377 | 641 | 754 | T2 (liste d'export, nouveau service) |
| PR-4a | chargeur, synchro, données, composition | 523 | 889 | 1 046 | T2 (données nouvelles) |
| PR-4b | page, registre, assertion du rendu | 480 | 816 | 960 | T2 (registre, phrases, chiffres) |
| **Total** | | **3 132** | **≈ 5 320** | **≈ 6 264** | |

- **Les deux PR suggérées ne tiennent pas** : « collecteur + score + fichier signé + vérificateur » = PR-1a + PR-1b + PR-2 + PR-3a = 1 752 lignes ascendantes, ≈ 2 980 à ×1,7 (sans l'hôte, PR-3b) ; « synchro + page + tests site » = PR-4a + PR-4b = 1 003, ≈ 1 705 à ×1,7. Les deux dépassent 1 205 avant même la dérive.
- **Coupe de repli** (si un G1 mesure plus de 1 150) : PR-1b → chaîne seule, puis vérificateur ; PR-2 → graines et instants, puis lectures et quorum ; PR-4a → chargeur et composition, puis synchro et données ; PR-4b → registre et assertion, puis page.
- **Mesure au G1** : `git diff --shortstat` depuis la base de fusion avec le pathspec de `ci.yml:82` recopié mot pour mot, fichiers non suivis ajoutés dans une copie de l'index (méthode du G1 PR-A, rappelée par ADR-BELL-OTS-PRB l.217).
- **Ordre** : ce G0 (une fois) → checkpoint-1 (une fois) → pour chaque PR : G1 (worker, journal G1 avec R-25 mesuré) → G2 (relecteur frais ≠ générateur) → checkpoint-2 → G7 (orchestrateur, fusion) → acte ou upload quand la PR a une surface servie.
- **Dépendances** : FAITS-RFC6962-1 et FAITS-SOLANA-PDA-TOKEN2022-1 avant le G1 de PR-1a ; FAITS-SOLANA-PUBLIC-RPC-TERMS-1 puis SNAPSHOT-PROBE-1 avant le G1 de PR-2 ; P-7 (hôte) et BELL-CA-DOJO-1 avant le G1 de PR-3b ; après PR-3b : DNS, clé (DOJO-KEY-1), unité, Caddy, ligne `anchor` publiée, jours comptés, premier paquet, publication, CA (actes de l'orchestrateur avec go) ; PR-4a après la première CA ; PR-4b après PR-4a ; passage à `built` en dernier (§5).
- **Condition de G7 de la pièce** : une ligne `anchor` et au moins une ligne `snapshot` servies, CA verte, données synchronisées, `assertDojoBody` vert sur le build réel, les deux tests d'intégration verts sur les données réelles ; sinon la pièce reste `upcoming` avec l'item nommé.

## 8. Textes publics proposés (anglais, liste fermée, à approuver)

`{…}` est rendu depuis `dojo-served.json`, jamais écrit en source. Aucun chiffre en source hors « SHA-256 » et « Ed25519 ».

- **TXT-1** (titre) : « Dōjō · hold snapshot »
- **TXT-2** (chapeau) : « A dated, public record of the MONARK token balances held by each address, read from the chain through two distinct operators, with a hold score per address. Every line is published, signed and chained, and anyone can recompute it. »
- **TXT-3** (état) : « Latest snapshot: {day} UTC · {k_reads} readings between slots {slot_min} and {slot_max} · {lines_count} lines · Merkle root {root} »
- **TXT-4** (seuil) : « Threshold: {threshold} token-days. The threshold is public; it changes only through a signed line, from the next day on, never backwards. »
- **TXT-5** (méthode) : « Each day, every address is read at instants drawn from a seed committed in advance and revealed afterwards; the day counts the smallest reading. When a balance decreases, the part that left starts again from zero, newest first. The hold score is the sum, over the days counted, of the part still held. »
- **TXT-6** (exclusion) : « An address off the Ed25519 curve is a program address, such as a pool or an escrow: its line is published with the class program and a hold score of zero. »
- **TXT-7** (bornes) : « What a snapshot shows: the balances two distinct operators reported for each address at the recorded slots, and the hold score computed from them. What it does not show: that an address belongs to one person, the balance between two readings, or anything to come. »
- **TXT-8** (vérifier) : « Check it yourself: download the signed timeline and a day's lines file; its SHA-256 must equal the value the signed line carries. Rebuild the Merkle root from the lines, sorted by address. Recompute your line from the previous day's line and the day's readings. Check the signature with the published key. The check does not read the chain. »
- **TXT-9** (arbre) : « The Merkle tree hashes each line with a leaf prefix and each pair with a node prefix, and splits at the largest power of two below the count. »
- **TXT-10** (total) : « Total hold score: {score_total} »

**Lexique** : permis : hold score, snapshot, reading, slot, threshold, token-days, line, root, signed, chained, recompute, program address, two distinct operators, seed, revealed. Interdits en plus des portes existantes : agent, reward, earn, airdrop, yield, eligible, right, entitle, soon, coming, live (seul), guarantee, verified, proven, certified (seuls), trustless, tamper-proof, at a point in time, real-time, ranking, leaderboard, top holders, score (sans « hold »).

Contrôle : aucune phrase ne nomme un opérateur, une plateforme de lancement, un pool ou un verrou par leur marque ; aucune ne dit ce qu'ouvre le seuil ; TXT-7 et TXT-8 portent les bornes (FM-2.4) ; « independent » n'est pas employé (réservé par Bell à l'horodatage, ADR-BELL-OTS-ANCHOR-1 l.256).

## 9. MAST (checklist de risque résiduel)

Source : corpus, doc 06 §6.4 (`06-framework-agents.md:267-271`, [lu], sha256 `55559227ff1ff79205c5c01746af00ed6cbb34c6999d0d7738c0f411885360f5`) ; identifiants tels qu'employés par `docs/adr/ADR-T1b-backend.md:524-541` ; article MAST (arXiv:2503.13657) non relu, [2nd] via le corpus.

| Mode | Menace dans ce lot | Contre-mesure |
|---|---|---|
| FM-1.1 spécification non suivie | plafond ou droit binaire codé en silence ; champ de prix dans une ligne | clés fermées ; M-S4, M-S5, M-E2 ; P-1 à P-3 tranchés avant le G1 |
| FM-1.2 rôle non suivi | un worker appelle le RPC réel, génère une clé ou committe | sonde et clé = actes de l'orchestrateur avec go ; R-20 |
| FM-1.3 répétition d'étape | deux lignes pour un jour ; paquet publié deux fois | `day_not_increasing` ; éditeur idempotent |
| FM-1.4 perte d'historique | secret de graines ou paquets perdus | copies durables hors dépôt ; fichiers `lines/` immuables ; miroir opérateur (motif `RUNBOOK-bell.md:362-377`) |
| FM-1.5 condition de fin ignorée | registre passé `built` sur fixtures | `dojo_register_is_frozen` ; condition de G7 (§7) |
| FM-2.1 reprise de conversation | collecteur coupé en cours de journée | valeur du jour sur les lectures concordantes ; écritures durables ; reprise |
| FM-2.2 clarification non demandée | T, K, N_min, hôte fixés par défaut | aucune valeur par défaut dans le code (configuration explicite, fail-closed) ; §10 |
| FM-2.3 dérive de tâche | agents, agrégation, score continu, données premium | frontière D-1 ; items |
| FM-2.4 rétention d'information | la page tait que les soldes sont un rapport d'opérateurs | TXT-7, TXT-8 exigées par `assertDojoBody` (M-P8) |
| FM-2.5 entrée ignorée | contradictions des lectures écartées | §2 et registre T, chaque ligne sourcée |
| FM-2.6 écart raisonnement / action | « verified » servi ; « une adresse, une personne » sous-entendu | lexique ; TXT-7 |
| FM-3.1 terminaison prématurée | G7 de PR-4b sur fixture seule | condition de G7 de la pièce |
| FM-3.2 vérification absente | collecteur testé sur une forme de réponse inventée | SNAPSHOT-PROBE-1 avant le G1 de PR-2, fixtures dérivées des réponses réelles |
| FM-3.3 vérification incorrecte | éditeur et vérificateur partagent un défaut | tests qui recodent racine et score ; équivalence avec le marcheur Bell ; G2 fraîche et checkpoint-2 (Fable, instance séparée) |

## 10. Points à trancher

### 10.1 Pour l'investisseur

- **P-1 (formule, H1)** — Reco : somme, sur les jours comptés, de la part encore détenue ; valeur du jour = plus petite lecture ; baisse ⇒ remise à zéro de la part sortie, la plus récente d'abord ; **aucun plafond**. Alternatives chiffrées (M2) : H1 tel quel, plafond C avec un droit par adresse : 1 droit sur une adresse, 29 si fractionné ; plafond avec unités : 3 contre 30 ; FIFO : 250 contre 300 (LIFO) sur [100, 150, 100] ; sans remise à zéro : 350, et l'ancienneté se transfère entre adresses (T-5). Motifs : Liu Q5-3 (p. 1), Messias Q5-3 (p. 13, p. 15-16), Messias Q6-3 (p. 19). Question liée : aucune décroissance du stock ancien (Wang Q5-3, enracinement) ; en voulez-vous une ?
- **P-2 (seuil et unité, H2)** — Reco : seuil fixe et public en jetons-jours, versionné par ligne signée, jamais rétroactif ; si un compte est publié, `floor(score / seuil)` par adresse (le fractionnement n'ajoute rien) plutôt qu'un droit binaire (qui multiplie les droits par fractionnement : 1 contre 29) ; plus un âge minimal. À fixer par vous : la valeur du seuil, l'âge minimal (sans plafond, un gros détenteur atteint le seuil dès le premier jour ; un plafond C imposerait T/C jours à tous) et le nombre maximal d'agents qu'une adresse peut obtenir (tout plafond par adresse rend le fractionnement rentable ; seul un plafond global ne le fait pas).
- **P-3 (une adresse, un score, H3)** — Reco : oui, sans agrégation ni parrainage ; vrai sous P-2 : un détenteur à k adresses perd au plus k − 1 unités d'arrondi. Sous un droit binaire, H3 pénalise le détenteur à plusieurs portefeuilles et récompense le fractionnement (Liu Q5-1, Q5-11).
- **P-4 (fréquence et instant, H4)** — Reco : K = 4 lectures par jour à des instants tirés d'une chaîne de graines engagée à l'avance et révélés après coup ; minimum du jour. Une présence sur la moitié du jour passe avec la probabilité 0,0625 (0,5 à K = 1, 0,0039 à K = 8) ; coût Helius 41 crédits par jour à K = 4. Heure fixe rejetée : un emprunt autour de l'instant obtient le score plein (M2). Résiduel : l'opérateur connaît les instants ; l'accepter, ou demander la recherche DOJO-RANDOMNESS-1.
- **P-5 (exclusion)** — Reco : adresses de programme (hors courbe) publiées avec un score nul ; les portefeuilles de plateformes d'échange comptent pour un détenteur (résiduel déclaré). Alternatives : aucune exclusion (un pool compte pour un détenteur) ; liste manuelle (fragile).
- **P-6 (adresses de l'équipe)** — Le créateur (sur la courbe, M3) compterait comme tout détenteur ; le verrou sera exclu si son compte de jetons a un propriétaire de programme (non confirmé). Reco : les compter, sauf si vous publiez une liste d'exclusion déclarée, datée et signée dans la chronologie.
- **P-7 (hôte et clé)** — Reco : hôte Bell, clé, utilisateur, unité, racine et nom distincts (`dojo.monarkgate.tech`) ; conséquences : CA de Bell amendée, deux clés dans les mêmes sauvegardes (rotation des deux sur exposition). Alternatives : nouveau petit VPS (isolation, coût à lire) ; VPS du site (rejeté pour la clé) ; machine opérateur (rejetée).
- **P-8 (départ)** — Reco : le premier jour UTC complet qui suit la publication de la ligne d'ancrage ; aucun historique antérieur (Messias Q5-8, p. 16 : aucun des deux choix n'est validé ; le rétroactif exigerait un rejeu d'archive).
- **P-9 (cadence)** — Reco : lectures quotidiennes par la machine opérateur (comme les courses de Bell, clés RPC déjà dans l'environnement opérateur) ; publication signée par acte de l'orchestrateur à une cadence découplée des lectures (l'ancre protège les instants) ; minuterie ensuite (DOJO-COLLECT-TIMER-1).
- **P-10 (textes publics)** — Reco : approuver la liste fermée du §8 ; rien sur l'agent ni sur ce qu'ouvre le seuil avant la pièce 2 ; page publiée seulement quand un snapshot est servi ; dites-nous quels mots du Dōjō sont déjà publics (aucun trouvé dans le dépôt).
- **P-11 (place sur le site)** — Reco : route `/dojo`, registre Dōjō distinct de la flotte, lien depuis `/token` ; lien de navigation à votre choix.
- **P-12 (question juridique)** — Non traitée ici : publication d'un score par adresse et droit lié à la détention du token. Reco : consultation du juriste avant la première publication (précédent JURISTE-ACTE-NOV-1), item DOJO-LEGAL-1.
- **P-13 (go de la sonde)** — Go par action pour SNAPSHOT-PROBE-1 (liste fermée d'appels et plafonds au §11), prérequis du G1 du collecteur.

### 10.2 Pour le checkpoint-1

- **P-14** — Série de sept PR au lieu de deux (§7 : dérive mesurée ×1,54 à ×1,98).
- **P-15** — Calque déclaré du marcheur, prouvé équivalent, plutôt que modification de `bell-chain.mjs` (redéploiement de Bell évité).
- **P-16** — Quorum par compte de jetons plutôt que sur l'ensemble (un seul compte mouvant bloquerait toute la lecture).
- **P-17** — Arbre de RFC 6962 sous réserve de FAITS-RFC6962-1 ; preuve calculée par le vérificateur ; aucun fichier de preuve servi.
- **P-18** — Fichiers de lignes réels non committés (R-25 : N lignes changées par PR ; taille, M3) ; composition rejouée sur fixture signée et données réelles liées à la CA (item DOJO-LINES-COMMIT-1).
- **P-19** — Registre Dōjō séparé avec son propre test de gel ; `fleet.ts` inchangé.
- **P-20** — `assertDojoBody` par liste fermée de chiffres (motif de la décision 217).
- **P-21** — Règles techniques : jour sans lecture concordante (ne compte rien, ne remet rien à zéro) ; horizon n de la chaîne de graines ; tolérance entre instant tiré et heure de lecture ; borne d'essais ; valeurs au G1, déclarées.
- **P-22** — Écarts relevés : épingle du mint (MISSION-PIN-FILE-1), hôte du FAITS runners (FAITS-RUNNERS-HOST-1), plan §1.2 et §2 (PLAN-DOJO-ERRATA-1).

## 11. Items formés (aucun « dû » nu)

| Id | Nature | Objet | Déclencheur | Propriétaire |
|---|---|---|---|---|
| **SNAPSHOT-PROBE-1** | acte, go par action (précédent décision 215) | liste fermée : (a) `getAccountInfo(mint, jsonParsed)` sur `helius` et `solana-foundation` (2 appels, 1 crédit) : programme, décimales, offre, extensions ; (b) `getProgramAccounts` Token-2022 filtré par le mint, `jsonParsed`, `withContext`, `finalized`, deux paires dos à dos sur les deux opérateurs (4 appels, 20 crédits) : acceptation, taille, N, forme, `context.slot`, concordance, propriétaires des comptes du pool et du verrou ; (c) `getSignaturesForAddress(mint)`, une page sur `helius` (1 crédit) : ordre de grandeur de l'activité A. Plafonds `--max-calls 12`, `--max-credits 60`. Réponses brutes hors dépôt sous `F:/PRODUITS/dojo-mirror/probe/` (sha256), FAITS daté ; aucune clé affichée (A-7) | après FAITS-SOLANA-PUBLIC-RPC-TERMS-1, avant le G1 de PR-2 | orchestrateur |
| **FAITS-SOLANA-PUBLIC-RPC-TERMS-1** | lecture sur place | conditions d'usage et limites du RPC public de la Solana Foundation, en particulier pour `getProgramAccounts` (règle 2026-09-20 : conditions lues avant tout appel) | avant SNAPSHOT-PROBE-1 | orchestrateur |
| **FAITS-RFC6962-1** | lecture sur place | RFC 6962 §2.1 : définition de l'arbre, chemins d'audit, vecteurs éventuels | avant le G1 de PR-1a | orchestrateur (ou lecteur sur le texte) |
| **FAITS-SOLANA-PDA-TOKEN2022-1** | lecture sur place | documentation Solana : adresses dérivées de programme hors courbe ; disposition d'un compte de jetons Token-2022 (offset du mint) ; forme `jsonParsed` ; paramètres de `getProgramAccounts` (`filters`, `withContext`, `dataSlice`) | avant le G1 de PR-1a (critère) et de PR-2 (requête) | orchestrateur |
| **DOJO-HOST-1** | décision puis actes | P-7 ; DNS, utilisateur, unité, Caddy, sauvegardes, RUNBOOK-dojo | avant le G1 de PR-3b | investisseur, puis orchestrateur |
| **BELL-CA-DOJO-1** | amendement | CA de l'hôte Bell (contrôles 11 et 12, Caddyfile) pour la cohabitation, si P-7 retient l'hôte Bell | G0 de PR-3b | orchestrateur |
| **DOJO-KEY-1** | acte | clé Dōjō générée sur l'hôte, trousseau committé et poussé avant toute ligne | après le G7 de PR-3a et le déploiement de PR-3b | orchestrateur |
| **DOJO-RANDOMNESS-1** | recherche de solutions | réduire le résiduel initié (T-10) : mélange d'une valeur publique future ou balise publique ; candidats à procurer : documentation drand (lecture sur place) ; J. Bonneau, J. Clark, S. Goldfeder, « On Bitcoin as a public randomness source », IACR ePrint 2015/1015 (identité citée de mémoire, à vérifier, jamais citée comme fait avant lecture) | si P-4 refuse le résiduel, avant le G1 de PR-2 | orchestrateur, puis chercheur |
| **DOJO-CONTINUOUS-1** | recherche de solutions | score continu par blocs : complétude (tout transfert Token-2022 du mint apparaît-il dans `getSignaturesForAddress(mint)` ?) et coût proportionnel à A | après SNAPSHOT-PROBE-1 ; G0 d'une pièce ultérieure | orchestrateur |
| **DOJO-LINES-COMMIT-1** | décision | committer ou non les fichiers de lignes réels (exclusion R-25 par amendement d'ADR-M003, épingle) | après SNAPSHOT-PROBE-1 (N mesuré) | orchestrateur |
| **DOJO-P2-RIGHT-BINDING-1** | conception | lier le droit à une signature de l'adresse, non transférable (T-6) | G0 de la pièce 2 | orchestrateur |
| **DOJO-COLLECT-TIMER-1** | code | minuterie des lectures | après sept jours de lectures opérateur sans trou, ou décision P-9 | orchestrateur |
| **CHAINSTACK-GPA-TARIFF-1** | lecture sur place et amendement | admettre `getProgramAccounts` dans la table RU si un autre opérateur est requis | si SNAPSHOT-PROBE-1 montre que l'opérateur public refuse la méthode | orchestrateur |
| **DOJO-LEGAL-1** | consultation | qualification juridique (P-12) | avant la première publication | investisseur |
| **FAITS-RUNNERS-HOST-1** | correction de document | `docs/roster/FAITS-github-actions-billing-runners-2026-09-25.md:24` (hôtes confondus) | prochaine édition du fichier, ou toute décision de runner | orchestrateur |
| **PLAN-DOJO-ERRATA-1** | correction de document | plan §1.2 (« 66 % », fermiers) et §2 pièce 1 (compte au-dessus du seuil) contre Messias Q5-1, Q5-2, Q5-6 | prochaine édition du plan | orchestrateur |
| **MISSION-PIN-FILE-1** | information | l'épingle du mint est `test/token-ca-pinned.test.ts`, pas `test/site-build-fleet.test.ts` | sans action | orchestrateur |

## 12. Non confirmé, et où j'ai cherché

1. Forme et prise en charge de `getProgramAccounts` sur Token-2022 (filtre, offset du mint, `jsonParsed`, `withContext`), chez les deux opérateurs : aucun appel dans le code du dépôt, aucun type Solana dans `node_modules` (§1.3). Sonde et lecture dues.
2. N (comptes de jetons, détenteurs) et A (transactions par jour) : aucune source du dépôt ; `DOSSIER:511-512` note que la liste des principaux détenteurs n'a pas été trouvée.
3. Programme, décimales, offre et extensions du mint : [2nd] seulement (§1.2).
4. Taux de concordance de deux lectures dos à dos : inconnu.
5. Limite de `getTokenLargestAccounts` : non lue ; la méthode n'est pas retenue.
6. Propriétaires des comptes de jetons du pool et du verrou : inconnus ; le critère de courbe s'y applique à la sonde.
7. Propriété « une adresse dérivée de programme est hors courbe » : non lue ici (item) ; les quatre contrôles de M3 la rendent plausible sans l'établir.
8. Définition exacte de l'arbre de RFC 6962 : non relue (réseau interdit).
9. État actuel de l'hôte Bell (services, Caddyfile) : non relu ; inféré de `RUNBOOK-bell.md` et `PASSATION-2026-09-24.md:62`.
10. Publication des cartes du sondage X : non confirmée.
11. Prix d'un nouveau VPS : non lu.
12. Conditions et limites du RPC public pour `getProgramAccounts` : non lues (item).
13. Sécurité du mélange engagement-révélation avec une valeur publique : non établie (item).
14. Complétude de `getSignaturesForAddress(mint)` pour les transferts Token-2022 : non établie (item).
15. Lien entre un emplacement (`slot`) et l'heure : le collecteur date ses lectures à son horloge ; le vérificateur ne peut pas relier emplacement et heure hors ligne (déclaré dans les données, TXT-8).

## 13. Sources et niveaux

- [lu] mission `F:\tmp\dojo\mission-g0-snapshot.md` (sha256 `8dcd4bec…9abc`).
- [lu] lectures scellées sous `F:\PRODUITS\dojo\biblio\_lectures\`, sha256 recalculés égaux à leurs fichiers `.sha256` : `LECTURE-Wang-2025-snapshot.md` `e0e52b724a281a8b375a7a006f2d243c53d280cc6d21f37ef59ef41039653355` ; `LECTURE-Lloyd-2023-veToken.md` `a544c1ac2ac658cf3af7d37fc70a56f5497bb8d1050a4bb9d317c9ceba801fbf` ; `LECTURE-Liu-2022-sybils.md` `05a845f8a06d22377d74ea2a75de654374f8119824af6c8415dd4ea871318300` ; `LECTURE-Chalkias-2020-DAPOL.md` `7068167f09ed96df76399c615bbcc7a32fc9210baa784ec05335336478feed51` (décision de l'orchestrateur en fin de fichier) ; `LECTURE-Messias-2025-airdrops.md` `2e9d06abf2a763df570057c893612f6f7f176babd6a4ac0fd37a8f155c810cdf`. Les pages citées sont celles des rapports ; les papiers eux-mêmes n'ont pas été relus par ce rédacteur : leur contenu est [lu] par les lecteurs, et ce G0 cite leurs rapports scellés.
- [lu] dépôt à `9ee4ab3` : chaque fichier cité avec sa ligne ; lus en entier : brief, plan, audit, `ADR-BELL-OTS-ANCHOR-1.md`, `ADR-BELL-OTS-PRB.md`, `operators.ts`, `pools.ts`, `bell-verify.mjs`, `bell-chain.mjs`, `bell-served-load.ts`, `sync-bell-served.mjs`, `RUNBOOK-bell.md`, `fleet.ts`, `ADR-M013`, `assert-fleet-html.mjs`, `ADR-M018`, `out/mint.txt`, `test/site-build-fleet.test.ts`, `test/token-ca-pinned.test.ts`, `quorum.ts`, `rpc.ts`, `tariff.ts`, `bell-methods.ts`, `supply.ts`, `discover.ts` ; lus par extraits : `collect.ts`, `transport.ts`, `export-public.mjs`, `ci-gates.test.ts`, `ci.yml`, `RUNBOOK-vitrine.md`, `RUNBOOK-sentinel.md`, `DOSSIER-COINGECKO-MONARK.md`, `SOURCES-coingecko.md`, `CHANTIERS.md`, `CARTOGRAPHIE-BRANCHEMENT-2026-09-24.md`, `PASSATION-2026-09-24.md`, `FAITS-github-actions-billing-runners-2026-09-25.md`, `ADR-T1b-backend.md:520-545`, `test/bell-served.test.ts` (recherches).
- [lu] hors dépôt : brief du tronc `F:\Monark\docs\dojo\BRIEF-DOJO-2026-09-25.md` (`ec39ff02…b90c`) ; FAITS Helius (`cc051ace…cf95`, lecture sur place de l'orchestrateur, 2026-09-21T05:47Z) ; `F:/tmp/dojo/cards/make-cards.mjs` (recherche) ; corpus : `templates/adr.md` (`ffface97bbf71d4f89dcb6b08b3cd443154cd6993dd5fa0c9af28a5f3286511e`), doc 06 §6.4.
- [2nd] : mint (programme, décimales, offre, comptes nommés) via le dossier token ; article MAST via le corpus ; RFC 6962 et documentation Solana nommées sans lecture (items FAITS-RFC6962-1 et FAITS-SOLANA-PDA-TOKEN2022-1).
- Mesures (§14) : sorties reproductibles ; aucun chiffre de seconde main n'est présenté comme fait.

## 14. Provenance

| Date | Objet | Modèle (identifiant résolu) | Effort | Contexte fourni | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-25 | G0 de la pièce 1 du Dōjō, `docs/adr/ADR-DOJO-SNAPSHOT-1.md`, non committé, base `9ee4ab3` | `claude-opus-5-5[1m]` | max | mission `F:\tmp\dojo\mission-g0-snapshot.md` ; lectures scellées ; documents Bell et site | worker | orchestrateur (R-21), puis checkpoint-1 | sans objet (G0) |

- **Mesures exécutées** (scripts écrits par l'outil d'écriture sous `F:/tmp/claude/F--Shogen/90684fb2-4e7b-42e9-b820-f042dc4465f3/scratchpad/`, hors dépôt, lancés sous `env -u` des huit variables payantes, `TEMP`, `TMP`, `TMPDIR` sous `F:/tmp`, `NEXT_TELEMETRY_DISABLED=1`, Node v24.15.0, sans réseau) : **M1** `m1-tariff-walk.mjs` (sha256 `4325698ae7b11e0017049f062f4ac109b2b05865386962f7de828a2729bf2c77`) : tables tarifaires et marcheur Bell (clé Ed25519 éphémère en mémoire, jamais écrite) ; **M2** `m2-rules.mjs` (`a951c971815f0d7b5942c5301bb291b27752debfa3a2782f76cb7ad97f2c56ac`) : règles de droit, conventions de lots, suites pseudo-aléatoires déterministes (générateur congruentiel, graine 12345) ; **M3** `m3-sizes-curve.mjs` (`f30f518a7f322b2c25a96850b952ac6be4332f3c3ee69b9fb73a859a8a684d50`) : tailles, courbe Ed25519, import d'une clé hors courbe. Rejeu : `node <script>` avec le même environnement, sorties égales à celles citées ; rejouées une seconde fois après l'écriture, sorties déterministes (la clé éphémère de M1 n'est pas imprimée), sha256 des sorties : M1 `e1de180a16c3d610e662e900565dedba70a2e2eaef4c8c3bf637ec19b9bb9dbc`, M2 `9bfe4a749ea7556b96c6f8c8dfb0ef781ab2d64424205a0cd71cb3ac6ddf1412`, M3 `57a73b5c92ece383710651356c98d3ba3b11365d8558455b8041af53aaa9fc6d` (fichiers `out-*.txt` du même répertoire).
- **Aucun** appel réseau, aucun appel RPC, aucun `GIT_DIR` ni `GIT_WORK_TREE` posé, aucun `git merge-tree --write-tree`, aucune commande `git` qui écrive (seulement `status`, `branch --show-current`, `rev-parse`, `log`, `merge-base`, `diff`, `diff --stat`, `grep`, en lecture). Une seule écriture dans le dépôt : ce fichier, écrit par l'outil d'écriture de fichiers (un heredoc aurait dépassé la borne de commande et réduit les barres obliques inverses), puis corrigé en place après relecture intégrale (trois numéros de ligne, deux formulations de budget et de coût, la cellule H3, et trois ajouts : verdict sur l'argument de la mission, rejet de `getTokenAccountsByOwner`, D-15 détaillé). Rien écrit sur C: par moi ; une sortie longue a été déposée par le harnais sous `C:\Users\KACIMI\.claude\projects\…\tool-results\`, puis relue par tranches depuis le fichier source sur F:.
- **Advisor** : non appelé (mission : « Aucune consultation advisor sauf blocage » ; aucun blocage).
- **`error_origin` proposés, à assigner au G7** : épingle du mint attribuée au mauvais fichier : rédaction de la mission (orchestrateur) ; hôtes confondus dans le FAITS runners : orchestrateur ; plan §1.2 et §2 contredits par Messias : planificateur (rédaction du plan, avant les lectures [lu]) ; série à deux PR sous-estimée : planificateur (mission), cause mesurée : dérive des estimations de tests.
