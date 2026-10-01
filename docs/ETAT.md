# ÉTAT — page snapshot du Dōjō (repartir du code)

Écrit le 2026-09-30 à 23:5x UTC, après vérification du code, des branches et des tests ; mis à jour le 2026-10-01 à 10:0x UTC.

## Règle

Toutes les décisions antérieures sont effacées, sur ordre de l'investisseur (verbatim : « efface toutes les décisions, toutes. tu vérifie code et ce qui est fait pour savoir ou tu es, les décisions y en a qui sont contradictoires, efface les toutes »).

- Les registres de décisions (`CHANTIERS`, `PASSATION`, `FILE-ATTENTE`) sont retirés du dépôt ; l'historique git les garde.
- Les lignes datées des ADR, la doctrine et les amendements de méthode ne s'imposent plus. Les ADR restent comme documentation du code.
- La seule référence est le code, ses tests et ce fichier, plus les consignes de l'investisseur à partir de maintenant.

## Consignes de l'investisseur, données ce jour

- **Mission** : la page snapshot du Dōjō, en ligne au plus vite, avec rigueur.
- **Méthode** : trois parties au plus ; une seule inspection par partie (relecture, tous les tests, checkpoint).
- **Tableau** : toutes les adresses, classées par score décroissant.

## Garde-fous gardés par l'orchestrateur, sauf avis contraire de l'investisseur

- Aucune dépense.
- Rien de publié sur X.
- Aucun secret ni adresse IP d'hôte publiés (voir « Adresse du serveur Bell » plus bas : déjà publique avant cette règle).
- Aucune suppression définitive sans accord.

## Ce qui existe dans le code

Tronc `lot/etude-suite`. Dernier oracle complet : 1 779 tests, dont 1 776 verts, 0 rouge et 3 ignorés.

- **Collecte des soldes par adresse** (lectures à instants tirés, deux opérateurs) : `apps/dojo/src/collect.ts`, `reading.ts`, `layout.ts`, `bundle.ts`. Unités : `deploy/monark-dojo-collect.service` et `.timer`.
- **Historique depuis la création du token** : `apps/dojo/src/history-collect.ts`, `history-build.ts`, `history-read.ts`.
- **Règle du score** : `apps/dojo/src/dojo-methods.ts` et `apps/dojo/scripts/dojo-core.mjs`.
- **Éditeur** : `apps/dojo/scripts/dojo-publish.mjs`, `dojo-chain.mjs`, `dojo-seed.mjs` et `dojo-eve.mjs`. Il vérifie tout avant d'écrire, puis publie la chronologie signée, les fichiers de lignes et la racine de Merkle.
- **Vérificateur public** : `apps/dojo/scripts/dojo-verify.mjs` et `dojo-verify-cli.mjs`.
- **Page `/dojo`** : `apps/site/app/dojo/page.tsx`, `apps/site/components/dojo/`, `apps/site/lib/dojo-*.ts`. Elle comprend la relecture dans le navigateur. Synchro : `scripts/sync-dojo-served.mjs`.
- **Garde des appels RPC et relais de hasard** : `packages/rpc-guard`.

## Ce qui n'existe pas encore

- **Rien ne tourne sur le serveur** : aucune collecte, aucune clé de signature (`apps/dojo/keys` absent).
- **Aucune donnée publiée** : pas de `apps/site/data/dojo-served.json`, donc la page ne s'affiche pas encore.
- **Corrections en cours avant l'inspection (partie 1)** :
  - le vérificateur nomme le refus d'un nombre non fini (`lot/verify-nonfinite`) ;
  - le test `dojo_collect_unit_runs_the_real_tick` devient déterministe (`lot/midnight-flake`, item DOJO-COLLECT-UNIT-TICK-MIDNIGHT-1 : rouge environ 1,5 % du temps quand un instant tombe dans les 300 dernières secondes du jour).
- **Livré et réuni sur `lot/page-v1`** (tête `1b57566c`) :
  - la garde de lancement des programmes de l'hôte ;
  - les unités de publication (minuterie 00:30, 01:30, 03:30, 06:30 UTC), le Caddy de l'hôte, les constantes de déploiement et le mode d'emploi, avec le jour zéro gardé ;
  - la publication de l'historique par l'éditeur (`--history`, vérifiée avant engagement, quatre refus nommés) ;
  - le tableau de toutes les adresses, classé par score décroissant (égalités par adresse), avec la recherche locale d'une adresse ;
  - l'écrivain unique de l'éditeur (`publish.lock`, refus `lock_held`, `--unlock` explicite), `--history` compris ;
  - les relais drand par le garde (cycle du jour), les verrous rendus sur SIGTERM, le refus `layout_stray_file` ;
  - le grand livre `rpc-guard` neuf, le corps borné pour le collecteur (chaîne et relais), les relevés entiers ;
  - corrections d'assemblage : mode d'emploi des refus de l'historique, de l'acte `--history`, de `lock_held` et de `--unlock` ; 31 tueurs réancrés ; imports des tests ; test de composition collecte vers publication aligné sur les relais par le garde.
  - Tests du Dōjō, de la page et de `rpc-guard` sur la branche réunie : 342, dont 340 verts, 0 rouge et 2 ignorés (la clé du serveur ; la variante par vrai signal sous Windows). Typecheck et lint à 0.

## Points connus (à traiter, non bloquants sauf mention)

- **Charge mesurée de la publication** : 80 s pour 1 144 adresses sur 30 jours, 559 s sur 365 jours, 562 s pour 10 000 adresses sur 30 jours. Limites de l'unité : `TimeoutStartSec=2900`, `MemoryMax=512M`. Au-delà d'environ 10 000 adresses sur un an, il faudra revoir la vérification avant écriture.
- **La CLI du vérificateur en `--url`** rend `unreachable` si le serveur ferme une connexion inactive pendant un long calcul. La vérification sur une copie locale n'est pas touchée.
- **Mode d'emploi** : les copies se comparent sur l'empreinte seule (64 caractères), car `sha256sum` sous Git Bash ajoute ` *`.
- **Unité** : deux directives systemd dépassent 160 caractères, sans coupure possible.
- **Corrigés à l'inspection de la partie 1** : nombres non finis (refus nommés partout), fichier étranger du paquet refusé, garde « dernier jour d'historique révolu », liste des refus testée par sites nommés, test du tableau rouge à la base par assertion, test de minuit déterministe, borne du corps testée, B-1 (premier jour compté).
- **Items avec déclencheur, issus de l'inspection (partie 2)** :
  - avant A-8, sur l'hôte : lire la forme `--property=UnsetEnvironment=` et `InaccessiblePaths=` de `systemd-run`, et vérifier que l'état de l'éditeur est sur un système de fichiers à liens physiques (FAITS-SYSTEMD-RUN-UNSETENV-1) ;
  - avant A-10 : `--unlock` retire aussi les `publish.lock.<pid>` dont le processus est mort (Q-10) ; ignorer l'échec du seul retrait du nom temporaire après un lien réussi (D3-1) ;
  - avant 18 (iv) : garde `test ! -e /var/lib/monark-dojo/publish.lock` avant le retrait du paquet (Q-14) ; une phrase : aucun acte sur l'éditeur ni sur `bundles/<d>` entre (iv) et le premier `snapshot` (Q-13) ; mesure de charge si l'historique dépasse la grille DOJO-VERIFY-SCALE-1 (Q-12) ;
  - avant A-11 (documentation) : la ligne TU-1h d'ADR-DOJO-PR-3 dit `readings/` seul, le code exige le jour clos entier.
- **Recherche du tableau** : elle contrôle l'alphabet base58, pas le décodage en 32 octets ; accepté à l'inspection (rendu sûr).
- **Mort d'un fichier de test sur ce poste** (item VERIFY-TEST-DEAD-CHILD-2) : sous charge, environ une fois sur vingt, un fichier de test
  meurt sans rien rapporter (code 0xC0000409, arrêt natif de Node sous Windows), déjà vu le 2026-09-29 sur un autre fichier. Ce n'est pas
  un défaut du code de la page. Règle d'ici là : un tel fichier est « non conclu » et l'oracle est relancé une fois. Pour nommer la cause,
  il faut une copie mémoire du processus mort : demande formée à l'investisseur (activer WER `LocalDumps` pour `node.exe`, ou fournir
  ProcDump et un débogueur) ; c'est un réglage du système, que l'orchestrateur ne fait pas lui-même.
- **Partie 1, état de l'inspection** : tête `lot/page-v1` = `e79d9714`. Relectures G2 collecte, éditeur et page approuvées ; oracle
  complet vert hors `r25` de la partie entière (1 849 tests, 0 rouge) ; F2P de toutes les pièces et corrections ; mutants 146 tués sur 147
  (K31 corrigé, K131 non conclu par un saut voulu). Checkpoint-2 du validateur : ACCEPTE-AVEC-CORRECTIONS. Relecture G2 neuve du lot
  DEPTH-BOUND : APPROUVE-AVEC-CORRECTIONS. C-1 : trois commentaires disaient qu'un texte hors JSON lève toujours, faux au-delà de la
  borne. C-2 : le comparateur de la borne du chargeur n'est épinglé par aucun test. Lot de correction DEPTH-CORR (commentaires, tests et
  documentation seulement ; mission verte `69e46e9c…`), lancé après la mesure du test 42 ; puis `red-proof`, mutant ciblé, oracle et
  checkpoint-2 sur le delta, sans G2 ciblée (`docs/methode/REGLES-MISSION.md` l.18). Avant la fusion aussi : mesure du test 42 (en
  cours ; ses passes de 09:2x à 09:5x UTC ont tourné pendant la relecture G2 : elles ne valent que si l'hôte était au repos), fusion par
  pas (jamais une fusion unique de 3 393 lignes), accord de l'investisseur pour la partie.
- **Provenance de l'inspection de la partie 1** (hors `F:/tmp`) : `F:/PRODUITS/inspections/page-partie1-2026-10-01/`, index `SHA256SUMS`
  (sha256 `e96d8f75fce1c213716660e33239a1dfb920f8fdd809be01add1937576ca8fd2`) : les cinq rapports (G2 collecte `61e65f55…`, G2 éditeur
  `8cbc8922…`, G2 page `95873fbc…`, F2P `9ef65dd9…`, passe mécanique `3007e888…`), le checkpoint-2 `3bc97433…`, la campagne de mutants
  `a3100dfc…`, le journal MUTANTS-NM `77542091…`, les records d'oracle `28aeca6d…` (`2e84103e`), `f932b387…` (incident, test 42 en
  délai dépassé) et `ea6fa608…` (`e79d9714`) ; la relecture G2 DEPTH-BOUND `221701fa…` et sa liste `ce85ac3d…` (écart déclaré du
  relecteur : deux `git status` sans `GIT_OPTIONAL_LOCKS=0`).
- **Items de l'inspection de la partie 1, avec déclencheur** (propriétaire : orchestrateur, sauf mention) :
  - avant le premier jour compté (A-9) : DOJO-BLS-VERIFY-1 (la signature BLS de la balise drand n'est pas vérifiée ; deux relais égaux
    exigés) ; collecte N-2 (`release` s'arrête au premier `unlock` qui échoue), N-3 (erreur anonyme dans `runs.jsonl`), N-4 et N-5 (flux
    rompu en cours de corps, cas à ajouter à `body-bound`) ;
  - avant A-7 : DOJO-SIGTERM-LINUX-PROOF-1 (vrai signal, sous Linux) ; avant A-11 : la ligne TU-1h d'ADR-DOJO-PR-3 alignée sur le code ;
  - à A-4p : DOJO-KEYRING-KILLER-REMEASURE-1 (le tueur K131 se mesure quand la clé existe) ;
  - avant 18 (iv) : DOJO-PUBLISH-SCALE-1 (fichier candidat de plus de 64 Mio pendant la vérification) ;
  - avant le premier `--anchor` sur Bell (partie 2) : PUBLISH-REQUEST-DEPTH-1 (la requête d'ancre de l'éditeur est lue sans borne de
    profondeur : `RangeError` sans nom à 500 000 niveaux, rien d'écrit ; la lire par `readJson`, `null` refusé `anchor_malformed`) ;
  - avant la première synchro (partie 3) : SYNC-SERVED-DEPTH-SCAN-1 (la synchro lit chaque ligne servie par `JSON.parse` sans mesure ;
    pas de récursion, un coût mémoire seul ; mesurer par `jsonDepth` et laisser à la construction le refus nommé) ;
  - avant l'envoi du site (partie 3) : DOJO-VERIFY-URL-IDLE-1 (CLI `--url` et connexion fermée), DOJO-LOOKUP-PAYLOAD-1 jambe 2,
    DOJO-LIVE-RENDER-ORACLE-1, page N-1 à N-4 et N-8 (TXT-17c, tests vides si la fixture change, état transitoire, fichier de lignes vide,
    `role="status"`) ;
  - hôte au repos, non bloquant : DOJO-MIDNIGHT-ALLFOUR-SEED-1 et collecte N-8 (branche de minuit couverte une course sur 72) ;
  - outillage, avant la prochaine campagne de mutants : MUTANTS-NM-UNLINK-1 et MUTANTS-NM-RECORD-1 ; avant le prochain rejeu `red-proof`
    d'un validateur sur un clone à jonctions : RED-PROOF-REPO-JUNCTIONS-1 ; avec VERIFY-TEST-DEAD-CHILD-2 : ORACLE-DEAD-CHILD-EXITCODE-1 ;
  - CV4-POWERSHELL-C-WRITE-1 : décidé, admis et déclaré (PowerShell réécrit son propre fichier de profil sur C: ; aucun fichier du projet) ;
  - MUTANTS-NM-WORKSPACES-1 : branché (outil réparé fusionné au tronc `eda6ff85`, première campagne d'un autre lot faite au checkpoint-2).
- **Textes du tableau** : TXT-17 et TXT-17a corrigés et TXT-17o ajouté (« Listed by hold score, highest first; equal hold scores by address. »), à valider par l'investisseur avec la page.
- **Adresse du serveur Bell** : déjà dans le dépôt public (19 fichiers de `main` depuis le 23/09, et le mode d'emploi du Dōjō). Ce n'est pas un secret : `bell.monarkgate.tech` y renvoie. Aucune clé n'est publiée.
- **Collecteur d'historique** : il lit encore les réponses sans borne de taille (`history-collect.ts` l.408-409). À borner avant le premier acte d'historique, après mesure de la plus grosse page (item RPC-GUARD-BODY-BOUNDS-ALL-1).
- **SIGTERM** : la variante par vrai signal du test est sautée sous Windows ; à prouver sur Linux avant A-7 (item DOJO-SIGTERM-LINUX-PROOF-1).
- **Mode d'emploi** : une commande de la section 9 tient sur une ligne de 629 caractères (une commande par ligne) ; exception déclarée.
- **Séries de marché (demande du fondateur, hors page)** : Binance BTCUSDT, ETHUSDT, BNBUSDT et SOLUSDT, bougies de 15 minutes du
  2024-10-01 au 2026-10-01 exclu, enregistrées le 2026-10-01 à 08:41-08:46 UTC après relecture favorable de RECHERCHES ; 70 080 bougies
  chacune, aucune manquante ; rejeu hors ligne identique. Stockées hors dépôt sous `F:/PRODUITS/marche/series-2026-10-01/`, NON
  redistribuables, scellées pour RECHERCHES jusqu'au pré-enregistrement (messagerie recherches#15). Coinbase : bloqué par ses conditions.
  Décision du fondateur reçue le 2026-10-01 (messagerie recherches) : usage des données couvert par des accords avec les plateformes ;
  fichier de faits privé ouvert hors dépôt, textes des accords attendus. Coinbase BTC-USD 15m : possible, pas prioritaire, après la partie 1.
- **ADR des katas de RECHERCHES (0005 v2, hors page)** : checkpoint-1 de MONARK le 2026-10-01, accepté avec corrections (messagerie
  recherches#17 ; rapport du validateur sha256 `262b3b62…`, nombres recalculés deux fois). v3 attendue avant P0. Q-7 (lieu public de
  l'empreinte de P0) chez l'investisseur. Tout travail de MONARK pour les katas vient après la page (P0, recalcul P2, revue P3, site P4,
  F-K-7, D10, F-K-1), sauf décision de l'investisseur. Item LIVE-1-RECORD-1 : enregistrer le bloc LIVE-1 (2026-10-01 → 2027-01-01) avec
  le même enregistreur ; déclencheur 2027-01-01 après minuit UTC ; conditions de Binance relues ce jour-là ; sha256 postés à RECHERCHES.
- **Dépôt `monark-governance` privé** depuis le 01/10 au moins : aucun push sans vérification préalable de la visibilité et accord de l'investisseur (une CI lancée par erreur à 01:04 UTC, annulée).

## Ce qui reste pour la page

1. **Partie 1, code** : finir les pièces en cours, les réunir sur `lot/page-v1`, une inspection, fusion au tronc.
2. **Partie 2, mise en service sur le serveur Bell** : utilisateurs, arbres, clé, unités, ancre signée, répétition R, paquet d'historique provisoire (Eve du premier jour), premier jour compté d (lu sur le plan du collecteur, R + 2 attendu), paquet final après la clôture de d, ligne `history`, première publication.
3. **Partie 3, site** : synchro des données, mandataire, envoi du site, validation visuelle de l'investisseur.

## Choix de travail actuels (révisables)

- **Premier jour compté et historique** (orchestrateur, 2026-10-01, correction du constat bloquant B-1 de l'inspection). L'ancien choix,
  « la répétition est le jour zéro de l'historique », ne pouvait jamais publier le premier jour compté. Le code impose en effet que la
  première publication porte sur le jour qui suit le dernier jour de l'historique.
  - `--first-read` = d, le premier jour collecté sous l'ancre réelle. Le paquet final est fait après la clôture de d.
  - L'Eve de d vient d'un paquet provisoire, fait avant l'ouverture de d avec `--first-read` = R (la répétition). Seule son Eve sert ;
    sa ligne n'est jamais engagée.
  - Avant d'engager sa ligne irréversible, `--history` vérifie que le jour d est clos et qu'il couvre toutes les adresses détentrices du
    dernier jour de l'historique. Sinon : refus nommé, rien d'écrit, et l'on recommence avec le jour clos suivant.
  - Prix : une course d'historique de plus. Résidu : une adresse qui acquiert des lots entre R − 1 et d − 1, puis ferme son compte avant
    le premier instant lu de d, fait sauter d (un jour de plus). Jamais une ligne fausse.

- **Au-delà de la borne de profondeur** (orchestrateur, 2026-10-01, G7 sur C-1 du G2 DEPTH-BOUND) : un texte servi plus profond que 16
  n'est pas analysé ; chaque lecteur le refuse sous le code de sa forme (`keyring_invalid`, `timeline_malformed`, phrases du chargeur),
  JSON ou non. `not_json` ne nomme qu'un texte hors JSON en deçà de la borne. Le code ne change pas ; ligne datée d'ADR avec DEPTH-CORR.
- Site envoyé depuis un commit validé du tronc ; `main` (844 commits de retard sur le tronc, qui a lui-même 47 commits de retard sur `main`, dont le moteur [W2]
  de RECHERCHES) est intégré après la page.
- Page servie dès la première publication.
