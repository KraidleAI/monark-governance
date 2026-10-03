# ÉTAT — page snapshot du Dōjō (repartir du code)

Écrit le 2026-09-30 à 23:5x UTC, après vérification du code, des branches et des tests ; mis à jour le 2026-10-02 à 02:2x UTC.

## Règle

Toutes les décisions antérieures sont effacées, sur ordre de l'investisseur (verbatim : « efface toutes les décisions, toutes. tu vérifie code et ce qui est fait pour savoir ou tu es, les décisions y en a qui sont contradictoires, efface les toutes »).

- Les registres de décisions (`CHANTIERS`, `PASSATION`, `FILE-ATTENTE`) sont retirés du dépôt ; l'historique git les garde.
- Les lignes datées des ADR, la doctrine et les amendements de méthode ne s'imposent plus. Les ADR restent comme documentation du code.
- La seule référence est le code, ses tests et ce fichier, plus les consignes de l'investisseur à partir de maintenant.

## Consignes de l'investisseur, données ce jour
- **Plan du mois (fondateur et investisseur, 2026-10-02 18:54 UTC, verbatim transmis)** : cinq chantiers dans l ordre : (1) la page
  snapshot, rien ne l interrompt ; (2) les corrections du moteur (audit P3) juste après : BYO-NEAR-NAME-1, SERVED-HARDENING-1, puis les
  prérequis bloquants de P3 (S-2, S-3, S-4/E-1, S-5/S-6, S-7, S-8, E-13/S-9) ; dès qu ils sont faits, mise en service de la vague 1 sans
  attendre la vague 2 ; (3) en parallèle de la page, SERIES-FULL-HISTORY-1 (quatre séries 15 min + natives 1h et 4h, de la première bougie
  au 2024-10-01 exclu, un dossier scellé par symbole, mois et intervalle, empreintes postées le jour même, rien transféré avant P0-2) et
  les FAITS (USDT/USD historique, événements 2022-09 → 2024-10 dont FTX, identités 2020-09 → 2024-10) ; (4) W2-E : RECHERCHES écrit les
  tests dès maintenant, MONARK code après le chantier 2 ; (5) RECHERCHES : tests W2-E, table de puissance, F-W2-9 avant P3, v7. Puis P0-2,
  descellement 2022-09 → 2024-10, course et recomputation aveugle, mise en service de la vague 2. Objectif : livraison dans le mois ;
  « si une étape ne tient pas, dis-le tout de suite et propose ce qu on diffère ». GO : SERIES-FULL-HISTORY-1 et ses FAITS (lancé le
  2026-10-02 à 18:54 UTC, `F:/PRODUITS/marche/history/`, enregistreur `48aa58b3…`) ; chantier 2 après la page, puis W2-E.
- **Décision investisseur (2026-10-02 19:06 UTC, verbatim : « Garde l ordre, chantier 2 d abord, W2-E après ») : Q-W2-23 de RECHERCHES refusée ;
  l ordre du plan du mois tient.
- **Décision investisseur (2026-10-02, verbatim : « pas de bloquant chez bonance, on utilise les données a notre guise »)** : la réserve sur
  la Prohibited Use Policy de Binance est levée par l investisseur ; les FAITS des conditions restent tels quels (usage interne).

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
  - avant A-8, sur l'hôte : FAITS-SYSTEMD-RUN-UNSETENV-1 (forme `--property=UnsetEnvironment=` et `InaccessiblePaths=` de
    `systemd-run` ; état de l'éditeur sur un système à liens physiques) : **fait** le 2026-10-01 à 12:5x UTC (ext4, journal privé) ;
  - Q-10 (`--unlock` retire aussi les `publish.lock.<pid>` dont le processus est mort) et D3-1 (ignorer l'échec du seul retrait du nom
    temporaire après un lien réussi), d'abord « avant A-10 ». **Décision datée (orchestrateur, 2026-10-02, 01:4x UTC, avis advisor)** :
    déclencheur déplacé au premier redéploiement de l'arbre de publication, à la première rotation de clé, ou au plus tard le
    2026-10-09. Motif : les deux cas arrêtent la publication ou laissent un fichier, sans rien écrire de faux (code lu à `d1120612`,
    éditeur de l'hôte identique au blob près). Parade : chaque lecture du §17 liste `publish.lock*` (lot RUNBOOK-PRE-IV) ;
  - avant 18 (iv) : garde `test ! -e /var/lib/monark-dojo/publish.lock` avant le retrait du paquet (Q-14) ; une phrase : aucun acte
    sur l'éditeur ni sur `bundles/<d>` entre (iv) et le premier `snapshot` (Q-13) ; mesure de charge si l'historique dépasse la grille
    DOJO-VERIFY-SCALE-1 (Q-12) : lot RUNBOOK-PRE-IV (G1 en cours depuis le 2 octobre, 01:4x UTC) ;
  - avant A-11 (documentation) : la ligne TU-1h d'ADR-DOJO-PR-3 dit `readings/` seul, le code exige le jour clos entier ; ligne
    datée de l'orchestrateur avec la fusion de RUNBOOK-PRE-IV.
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
  pas (jamais une fusion unique de 3 393 lignes).
- **Accord de l'investisseur pour la partie 1** : « oui », le 2026-10-01 à 10:1x UTC, en réponse à la phrase présentée à 09:08 UTC
  (correction 3 (f) du checkpoint-2) : « Choix B-1 : le premier jour compté vient après le jour de répétition (en principe deux jours plus
  tard), au prix d'une course d'historique supplémentaire. Risque restant : si une adresse achète puis ferme son compte juste avant la
  première lecture de ce jour, on perd un jour. On ne publie jamais une ligne fausse. »
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
  - avant A-9 (7), l'activation de la minuterie de collecte (relecture G2 de FAST-START, C-2 ; A-7 n'est plus sur le chemin réel) :
    DOJO-SIGTERM-LINUX-PROOF-1 (vrai signal, sous Linux) ; avant A-11 : la ligne TU-1h d'ADR-DOJO-PR-3 alignée sur le code ;
  - à A-4p : DOJO-KEYRING-KILLER-REMEASURE-1 (le tueur K131 se mesure quand la clé existe) ;
  - avant 18 (iv) : DOJO-PUBLISH-SCALE-1 (fichier candidat de plus de 64 Mio pendant la vérification) ;
  - après la première publication (report de la mise en service accélérée ; l'ancien déclencheur « avant le premier `--anchor` » est
    remplacé) : PUBLISH-REQUEST-DEPTH-1 (la requête d'ancre de l'éditeur est lue sans borne de
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
- **Items de la partie 3, formés le 2026-10-02 à 08:5x UTC** (checkpoint de la partie, rapport `aca2af79…`, corrections 1 et 2 ;
  propriétaire : orchestrateur) :
  - avant CA-1 : FAITS-CADDY-LEXER-COMMENT-1 (N-3 de la G2 : lecture sur place du lexeur de Caddy v2.11.4, un `#` hors début de jeton
    ouvre-t-il un commentaire ; puis une seule fonction de lecture des `import` pour les deux CA) ; DOJO-CA-CLI-ONE-RED-1 (N-5 : la CLI
    de la CA n'imprime jamais `VERIFY OK` sous un seul contrôle rouge ; un cas de test à un seul rouge, qui tue le mutant M2) ;
  - avant le prochain lot qui touche les gardes du mode d'emploi : FAITS-SYSTEMCTL-IS-ACTIVE-1 (code de sortie de `systemctl is-active`
    pour une unité arrêtée, lu à la source ; d'ici là, `pipefail` lu à l'acte, N-2, §17) ;
  - au prochain lot RUNBOOK, avant la première commande par le nom (§15 (0), migration de Bell) : RUNBOOK-BY-NAME-2 (Q-1 et Q-11 (b) :
    §16 et §19 par le nom, `-o StrictHostKeyChecking=yes` sur toute commande par le nom ; Q-3 (b) : `git status --porcelain
    --untracked-files=all` vide sur les chemins des outils, dans le bloc de §15 (4) et de §22 (1)) ;
  - avant la prochaine fusion d'un lot : FUSION-KILLER-ANCHORS-1 (Q-7 (b) : à chaque fusion, contrôle de TOUT tueur qui vise un fichier
    du diff, pas seulement ceux des fichiers de test changés ; `red-proof` sur la base de la partie) ;
  - avant le go de la migration de Bell, le même jour que l'acte : BELL-RUNBOOK-ROLLBACK-CANDIDATE-1 (retours arrière REPLACE de
    RUNBOOK-bell : forme candidat, `caddy validate`, `mv`, `reload`, au lieu de copier la sauvegarde sur le fichier actif) ;
  - au G1 du prochain lot qui change `deploy/Caddyfile.monark-bell` : BELL-CADDY-IMPORT-REPLAY-1 (après la migration, rejouer le
    fichier dédié par candidat importé, `validate`, `mv`, `reload`, étapes 8 et 11 au nouveau G7 ; retour par le dédié sauvegardé) ;
  - après l'envoi du site, avant le jour de l'annonce : DOJO-SITE-PROXY-XFF-MEASURE-1 (Q-6 : un amont temporaire en boucle locale du
    serveur du site renvoie les en-têtes reçus, derrière une copie du bloc `reverse_proxy` de l'extrait ; une requête porte
    `X-Forwarded-For`, `X-Real-IP` et `Forwarded` ; attendu : aucun des trois, aucune adresse du client ; un acte sous go, une FAITS).
  - au premier lot de l éditeur qui redéploie l arbre de publication (DJ-L190, L191, L34, au plus tard 2026-10-09) :
    DOJO-CHAIN-COMMENT-STALE-1 (voie (b) de l investisseur, 2026-10-02 14:20 UTC : la ligne de commentaire de `dojo-chain.mjs` est revenue
    au texte de `c0c60617`, faux depuis SITE-PREP ; à corriger dans ce lot, jamais seule).
- **Textes du tableau** : TXT-17 et TXT-17a corrigés et TXT-17o ajouté (« Listed by hold score, highest first; equal hold scores by address. »), à valider par l'investisseur avec la page.
- **Adresse du serveur Bell** : déjà dans le dépôt public (19 fichiers de `main` depuis le 23/09, et le mode d'emploi du Dōjō). Ce n'est pas un secret : `bell.monarkgate.tech` y renvoie. Aucune clé n'est publiée.
- **Collecteur d'historique** (report décidé par l'orchestrateur le 2026-10-01, cp-2 de la partie 2, correction 1) :
  RPC-GUARD-BODY-BOUNDS-ALL-1 passe après la première publication. Atténuation : les courses tournent sur la machine de l'opérateur,
  jamais sur l'hôte ; une réponse démesurée ne peut que faire échouer la course (refus ou arrêt), jamais écrire une ligne. Constat
  d'origine : il lit encore les réponses sans borne de taille
  (`history-collect.ts` l.408-409). À borner avant le premier acte d'historique, après mesure de la plus grosse page (item RPC-GUARD-BODY-BOUNDS-ALL-1).
- **SIGTERM** : la variante par vrai signal du test est sautée sous Windows ; à prouver sur Linux avant A-9 (7) (item DOJO-SIGTERM-LINUX-PROOF-1 ; C-2 de la G2 de FAST-START).
- **Mode d'emploi** : une commande de la section 9 tient sur une ligne de 629 caractères (une commande par ligne) ; exception déclarée.
- **Séries de marché (demande du fondateur, hors page)** : Binance BTCUSDT, ETHUSDT, BNBUSDT et SOLUSDT, bougies de 15 minutes du
  2024-10-01 au 2026-10-01 exclu, enregistrées le 2026-10-01 à 08:41-08:46 UTC après relecture favorable de RECHERCHES ; 70 080 bougies
  chacune, aucune manquante ; rejeu hors ligne identique. Stockées hors dépôt sous `F:/PRODUITS/marche/series-2026-10-01/`, NON
  redistribuables, scellées pour RECHERCHES jusqu'au pré-enregistrement (messagerie recherches#15). Coinbase : bloqué par ses conditions.
  Décision du fondateur reçue le 2026-10-01 (messagerie recherches) : usage des données couvert par des accords avec les plateformes ;
  fichier de faits privé ouvert hors dépôt, textes des accords attendus. Coinbase BTC-USD 15m : possible, pas prioritaire, après la partie 1.
- **ADR des katas de RECHERCHES (0005 v2, hors page)** : checkpoint-1 de MONARK le 2026-10-01, accepté avec corrections (messagerie
  recherches#17 ; rapport du validateur sha256 `262b3b62…`, nombres recalculés deux fois).
  v3 reçue (recherches `2d4619c`, sha256 `d8881c71…`), contrôle par diff en cours. Q-7 décidée par l'investisseur à 10:2x UTC :
  « c est ok pour le depot publique, tout en anglais c est tout ». Dépôt public `KraidleAI/monark-precommitments`, créé à 10:24 UTC
  (présentation et table vide, tout en anglais, aucune CI), sans horodatage tiers ; P0 y inscrit les empreintes après le contrôle par
  diff et la validation du fondateur.
  Tout travail de MONARK pour les katas vient après la page (P0, recalcul P2, revue P3, site P4,
  F-K-7, D10, F-K-1), sauf décision de l'investisseur. Item LIVE-1-RECORD-1 : enregistrer le bloc LIVE-1 (2026-10-01 → 2027-01-01) avec
  le même enregistreur ; déclencheur 2027-01-01 après minuit UTC ; conditions de Binance relues ce jour-là ; sha256 postés à RECHERCHES.
- **Dépôt `monark-governance` privé** depuis le 01/10 au moins : aucun push sans vérification préalable de la visibilité et accord de l'investisseur (une CI lancée par erreur à 01:04 UTC, annulée).

## Ce qui reste pour la page

1. **Partie 1, code** : finir les pièces en cours, les réunir sur `lot/page-v1`, une inspection, fusion au tronc.
2. **Partie 2, mise en service ACCÉLÉRÉE sur le serveur Bell** (décision de l'investisseur du 2026-10-01, voir « Choix de travail ») :
   faits le 2026-10-01 : contrôles, A-2, A-3 (arbre de collecte de `89403796`), A-4 (graines, fichier d'environnement), A-5 (unités,
   minuterie non activée), A-2p. Journal privé : `F:/PRODUITS/dojo-mirror/JOURNAL-mise-en-service-2026-10-01.md`. Reste : arbre de
   publication et clé (après DEPTH-CORR et l'envoi du trousseau), ancre signée sans attente du bloc Bitcoin, historique provisoire (lot
   FAST-START), départ réel le jour de l'ancre, premier jour compté d = lendemain, paquet final après la clôture de d, ligne `history`,
   première publication.
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

- **Mise en service accélérée** (investisseur, 2026-10-01, mot pour mot : « différe la preuve bitcoin, accélére le travail, on doit
  publier quelque chose, il faut finir le snapshot. avec les scores déja realisés a ce jour. et qui se mettent a jour. on rajoute le
  timestamping aprés publication ») : plus de jour de répétition (lu comme un oui) ; ancre signée sans attendre le bloc Bitcoin,
  horodatage après la première publication (DOJO-ANCHOR-OTS-AFTER-PUBLICATION-1) ; historique provisoire sans jour clos (lot FAST-START) ;
  premier jour compté = lendemain du jour de l'ancre. Objectif : départ réel ce soir avant minuit UTC, page le 3 octobre, sinon le 4.
- **Valeurs de l'ancre** (investisseur, 2026-10-01 ; amende DOJO-OBJECTIVES-1) : « 30 jours, l unité c est 1000$ tenu 30 JOURS. chaque
  unité est un pallier. » et « 180 jours pour Migration ». Donc `objective_unit_microusd_days` 30 000 000 000, `tier_units` 1 à 5,
  `tier_windows` 30, 30, 30, 30, 90 (correction ci-dessous), `validation_days` 30 ; inchangés : poussière 1 $, 7 jours de prix, 4 lectures, horizon 365.
  Le texte du site « sixty days » (`apps/site/lib/dojo-copy.ts:46`) passe à « thirty » avant l'envoi du site (DOJO-COPY-VALIDATION-30-1).
  - Correction de l'investisseur (2026-10-01 19:4x UTC, mot pour mot : « corrige. la migration c est aprés 90 jours. pas 180 désolé
    j avais pas fait atention à ça avant. ») : Migration à 90 jours. Seconde ligne d'ancre signée à 19:56:58Z (seq 2, `line_hash`
    `1e50d25f…`), voie prévue par le code (DOJO-WALK-GAPS-1 (c)), avant tout jour publié ; la ligne 1 (180, signée à 16:14Z, jamais
    servie) reste dans la chronologie : la correction y est visible et vérifiable. Accréditation du collecteur = ligne 2. La page lit
    l'ancre en vigueur (la dernière avant la tête) ; sa phrase `tier` lira la durée dans l'ancre (DOJO-COPY-DURATIONS-DERIVED-1, tour
    SITE-CORR). L'horodatage reporté (DOJO-ANCHOR-OTS-AFTER-PUBLICATION-1) couvrira aussi la ligne 2.
- **Reports après la première publication** (investisseur : « Oui, après publication » pour drand) : DOJO-BLS-VERIFY-1 (en attendant,
  deux relais doivent rendre le même tirage, sinon pas de plan), PUBLISH-REQUEST-DEPTH-1, DOJO-UNIT-OFFLINE-ORACLE-1, collecte N-2 à N-5,
  HELIUS-CREDIT-RECONCILE-1 (plancher conservateur 7 900 000 en attendant le relevé du tableau de bord).
- **Conditions de l'en-tête du mode d'emploi** (cp-2 de la partie 2, correction 3), statut au 14:5x UTC :
  - FAITS-JOURNALCTL-1 : sans objet sur le chemin réel (il sert au critère de répétition de A-7, retiré) ; à lire avant la première
    surveillance par le journal, après la première publication ;
  - DOJO-DRAND-RELAY-TERMS-1 : fait (`docs/dojo/FAITS-drand-relays-terms-2026-09-27.md`) ; relais par le garde : dans la partie 1 ;
  - QI-5 : rempli, la graine de répétition n'a servi qu'au départ de contrôle de A-5, jamais ancrée ni publiée ;
  - RPC-GUARD-FIRST-APPEND-HEAD-1 : fait (`packages/rpc-guard/test/first-append.test.ts`) ;
  - P-4 : rempli par le tirage drand du jour (`read_rule` de l'ancre, deux relais égaux exigés) ;
  - DOJO-OPERATOR-INDEPENDENCE-1 (amont commun des deux opérateurs, non mesuré) : reporté après la première publication.
- **Qui a décidé les reports** (cp-2 de la partie 2, correction 4) : l'investisseur pour l'horodatage Bitcoin et pour drand (verbatim
  plus haut) ; l'orchestrateur, sous la directive « accélère le travail », pour PUBLISH-REQUEST-DEPTH-1, DOJO-UNIT-OFFLINE-ORACLE-1,
  collecte N-2 à N-5, HELIUS-CREDIT-RECONCILE-1, CA-0, RPC-GUARD-BODY-BOUNDS-ALL-1 et DOJO-OPERATOR-INDEPENDENCE-1 ; aucun ne peut
  produire une ligne fausse, au pire un jour de plus.
- **Dépôt `monark-governance`** : l'investisseur le rend public lui-même (« Je le rends public quand même »), après avertissement
  (atelier entier, documents internes en français, adresse IP du serveur dans le mode d'emploi, noms internes) : exception de
  l'investisseur au garde-fou sur l'adresse IP ; aucun envoi avant son signal.
- **Test 42** (EXPORT-CI-TIMEOUT-BOUND-1, rapport `a1330724…`) : décidé (a), `npm run ci` passe de 600 à 1 800 s, `npm ci` reste à
  600 s ; la lenteur vient de `apps/sentinel/test/ukemi-conc.test.ts` (32 586 fsync) sous contention d'entrées-sorties, pas de la page.
  Items : UKEMI-CONC-FSYNC-1, TEST42-ORPHAN-KILL-1, HOST-FOREIGN-LOAD-CV4-1, et une pièce de plus pour VERIFY-TEST-DEAD-CHILD-2.
- **Avancement de la mise en service** (13:1x UTC) :
  - partie 1 : DEPTH-CORR (`e6b52de6`) et T42-BOUND (`24376bf9`, tronc) acceptés au checkpoint-2 ciblé (`206bc5e3…`, oracle cp-2
    `5a63b991…` sortie 0) ; `lot/page-v1` avancée à `e6b52de6`, puis le trousseau `764f2302` (A-4p) ; item CI-G3-TIMEOUT-MINUTES-1
    (C-V-1 du cp-2) : le job `g3-verification` (`timeout-minutes: 10`) passe à 45 par ligne d'ADR qui amende le plafond de
    `test/ci-gates.test.ts` l.1673 ; décision de l'orchestrateur (2026-10-01, avant le G7 de la fusion de T42-BOUND) : défaut
    latent, la CI ne tourne que sur une PR ; déclencheur : avant la première PR ouverte sur `monark-governance` ;
  - hôte : A-2 à A-5, A-2p, A-3p (G7 `e6b52de6`, deux arbres TREE-EQUAL), A-4p (clé née sur l'hôte, key_id `c7963c9b…`),
    A-5p (départ à blanc `history_missing`, rien d'écrit), FAITS-SYSTEMD-RUN-UNSETENV-1 lu sur l'hôte ; journal privé cité plus haut ;
  - oracle complet du commit du trousseau : premier passage `a10fd4b8…` rouge par le seul test 42 (1 test de l'export sur 534, sous
    la charge des relecteurs ; le fichier ajouté n'est pas exporté) : non conclu, relancé une fois ;
  - lot FAST-START `5f694f83` livré (oracle G1 `f8e251f0…` sortie 0), relecture G2 en cours ; envoi du trousseau en attente du
    signal de l'investisseur (`monark-governance` public) ; signature de l'ancre ensuite (A-8).
- **Reporté aussi après la première publication** : CA-0, le contrôle de conformité hors ligne (`scripts/verify-dojo.mjs`, PR-3b-2b,
  jamais écrit ; item DOJO-CA0-SCRIPT-1) ; en attendant, chaque acte sur l'hôte est contrôlé par empreintes.
- **Katas (hors page)** : P0 publié (`KraidleAI/monark-precommitments` commit `36c09828`, reçu par GitHub à 11:47:32Z ; validation
  du fondateur « ok je valide l'adr ») ; revue MONARK de P1 : approuvée avec corrections (A-1 à A-8 ; rapport `6ead4219…`, messagerie
  recherches#23) ; décisions de l'investisseur : spécification dans un nouveau dépôt public `KraidleAI/monark-kata-spec` après A-3,
  séries par pièce jointe privée du dépôt recherches à la clôture de P1.
  P1 close le 2026-10-01 (contrôle de clôture APPROUVE, rapport `b9b34076…`, tête recherches `7174835`). Écart R-25 de P1b inscrit (D-2) :
  1 234 lignes au périmètre CI du tronc, au-dessus de la porte de 1 205, accepté sans réécriture d'un historique déjà fusionné ; la règle
  de mesure de RECHERCHES est désormais celle du tronc (`kata/scripts/r25.sh`).
  P2 : plan v3 accepté sans réserve (recherches#29). Enregistreur 1h et 4h (`lot/series-intervals` `599c29d4`, script
  `48aa58b3…`, oracle G1 sortie 0 sur l'arbre même du commit ; relecture de RECHERCHES favorable, #30) ; documentation relue sur
  place (H-6, `docs/marche/FAITS-binance-klines-2026-10-01.md`), conditions relues avant la première requête. Huit séries
  enregistrées de 19:32 à 19:33 UTC (92 requêtes, aucune bougie manquante, rejeu égal), pièce jointe privée
  `monark-series-binance-1h-4h-2026-10-01` (#31). Suite : épinglage R-1 par RECHERCHES, contrôle du diff, descellement.
  Items : RED-PROOF-CHILD-STDERR-1 (déclencheur atteint, deuxième mort d'un enfant sur 63 passages : lot d'outillage après la
  première publication ; d'ici là, toute mort d'enfant est rejouée une fois en `--test-isolation=none`, déclarée) ;
  LOOPBACK-SEQUENTIAL-PORTS-1 (port 0 attribué en séquence sur cet hôte) ; REPLAY-INTERVAL-BIND-1 (le brut ne nomme pas son
  intervalle).
  Suite de P2 (messagerie #32 à #36) : séries descellées, recensement et parité exacts ; P2a-1 relu (#33), plié et contrôlé (#35) ;
  audit P3 de notre moteur : 24 points confirmés, 3 partiels, S-5 tranché en 400 nommé (#34) ; P2a-2 relu (#36) : quatre corrections,
  Q-P2a-4 voie (c) (seul le motif de la venue exempté dans le registre privé). Accord « P2a complet » après le pli et notre contrôle.
  P2a complet (#38) ; P2b couru localement par RECHERCHES le 2026-10-02 (280 lignes, registre `811fcd57…`, rapport `e91edb41…`, non
  commis) ; Q-P2b-1 décidée par l orchestrateur (#39, 14:15 UTC) : voie (b), exclusion R-25 fermée de `kata/registry/*.json` sourcée,
  déclarée et testée, octets = empreintes annoncées, banc inchangé à `1ea4f64`.
  Item MONARK P2-RECALC-TOOL-1 : outil de recalcul indépendant des 280 lignes et oracle des métriques sans réseau, avant la comparaison
  des résultats de P2b, notre empreinte déposée avant toute lecture de leur registre (symétrie, #39) ; lancement sur go de l investisseur ; lots BYO-NEAR-NAME-1 (S-11, servi aujourd'hui) puis SERVED-HARDENING-1 après la première publication de la
  page ; version datée de la spécification publique (S-5) avant P3.
- **Au-delà de la borne de profondeur** (orchestrateur, 2026-10-01, G7 sur C-1 du G2 DEPTH-BOUND) : un texte servi plus profond que 16
  n'est pas analysé ; chaque lecteur le refuse sous le code de sa forme (`keyring_invalid`, `timeline_malformed`, phrases du chargeur),
  JSON ou non. `not_json` ne nomme qu'un texte hors JSON en deçà de la borne. Le code ne change pas ; ligne datée d'ADR avec DEPTH-CORR.
- Site envoyé depuis le commit validé de la branche de la page (G7 des parties 1 et 2, puis du site), choix révisé le 2026-10-01 :
  la première fusion par pas au tronc (`8950ab15...d07ad193`) est rouge sur 2 tests réels (`dojo_two_units_share_no_writable_path`,
  `dojo_runbook_stops_before_the_stamp_and_on_refusals`, record `d3d2855f…`) : les états intermédiaires de `lot/page-v1` ne sont pas
  tous verts. Item TRUNK-MERGE-STEPS-1 : un découpage dont chaque pas est vert, déclencheur après la première publication.
  Déclencheur AVANCÉ par l investisseur le 2026-10-02 à 14:4x UTC (verbatim : « accord sur la partie 3, fusionne au tronc ») : fusion
  de `lot/page-v1` (`f39e679c`, G7 accepté) au tronc en pas consécutifs, chaque pas sous R-25 (1 150) et prouvé vert par un oracle du
  tronc avant d être pris ; coupes = commits de la branche dont l arbre est vert (magasin d oracles, ou course neuve) ; aucun conflit
  et aucun fichier de code touché des deux côtés (mesuré).
  Le tronc a reçu T42-BOUND (`ccfc5820`, oracle G7 `46aced61…` sortie 0, premier passage non conclu au test 42).
  Ancien choix : `main` (844 commits de retard sur le tronc, qui a lui-même 47 commits de retard sur `main`, dont le moteur [W2]
  de RECHERCHES) est intégré après la page.
- Validation visuelle C-V-4 (investisseur, 2026-10-02 17:0x UTC, verbatim : « ok pour les six questions, garde tout comme c est ») :
  les six points gardés tels quels ; volets DOJO-PAGE-FOLD-1 fusionnés au tronc (`4ce547b0`, oracle vert).
- Q-4 budget mobile tranchée par l investisseur (2026-10-02 17:17 UTC, verbatim : « on envoie comme ça, on corrige après ») : la page est
  envoyée avec le relevé rouge de laboratoire (TBT 191 à 324 ms à 10^3 lignes ; table débordante à 375 px). Item DOJO-MOBILE-AFTER-SEND-1 :
  premier lot de la page après la première publication = DOJO-TABLE-DIGEST-LEVELS-1 (constructions chiffrées, ADR-DOJO-PR-4 PK-5) et un
  défilement horizontal de la table, sans changer un mot ; déclencheur : avant 3 000 lignes au snapshot, ou une mesure réelle au-delà de 2,5 s.
- Tronc = `lot/page-v1` fusionnée en neuf pas verts le 2026-10-02 (17:04 UTC, `d10d757f`) ; le site part du tronc.
- Items katas (relecture EPOCH-EVENTS-1, 2026-10-02 16:25 UTC ; porteur orchestrateur ; déclencheur : ADR de préparation P3, sauf mention) :
  RECORDER-SCALE-BREAK-1 (arrêt nommé sur un saut de prix, facteur 5 proposé ; déclencheur AVANCÉ par le checkpoint-1 v6 : avant le
  descellement des blocs de la vague 2, D5 exige EE-5 sur les octets passés), RECORDER-SCHEMA-FIELDS-1, RECORDER-EXCHANGEINFO-1 (sur go,
  section lue avant appel), USDT-USD-REFERENCE-1 (flux Pyth USDT/USD lu comme SOL/USD), ENGINE-ROW-RETIRE-PATH-1 (lot d une ligne, latence
  mesurée), RECALC-FIELDS-2 (les sept champs sortent de la liste ignorée à la prochaine recomputation).
- Items vague 2 (relecture de l ADR v3, 2026-10-02 18:1x UTC, recherches#48) : SERIES-MONTHLY-2027-1 RETIRÉ le 2026-10-02 (v5 : les blocs
  sont pris dans le passé ; remplacé par SERIES-FULL-HISTORY-1 ci-dessous, C-5 du checkpoint-1 v6), W2-E (lot moteur `tail.ts`,
  `class-policy-v2`, tests écrits par RECHERCHES d abord ; après le moteur MONARK, avant novembre 2026), FAITS-US-DST-1, FAITS-FUNDING-HOURS-1,
  FAITS-PYTH-USDT-USD-1 (avant P0-2) ; USDT-USD-REFERENCE-1 étendu aux rondes BTC/USD, ETH/USD, SOL/USD. Checkpoint-1 formel du
  validateur-humain sur l ADR vague 2 : lancé sur la v6 le 2026-10-02 à 18:4x UTC. SERIES-MONTHLY-2027-1 retiré (v5 : données passées).
- Items vague 2 v6 et v7 (2026-10-02, recherches#50, #52) : FAITS-USDT-USD-HISTORY-1 (2022-09 → 2024-10), FAITS-IDENTITY-2020-2024-1
  (2020-09 → 2024-10), FAITS-EVENTS-2022-2024-1 (2022-09 → 2024-10, FTX compris), avant P0-2 ; ENGINE-ROW-RETIRE-PATH-1 devient BLOQUANT
  avant tout service d une ligne de la vague 2 (condition 2 de Q-W2-26) ;
  SERIES-FULL-HISTORY-1 FAIT le 2026-10-02 (19:19 UTC) : 914 courses, 762 dossiers scellés sous `F:/PRODUITS/marche/history/` (symbole × mois ×
  intervalle), empreintes postées (recherches, pièces `2026-10-02-series-full-history`), rien transféré ; 153 arrêts `close_time` (bougies
  tronquées 2017-2021, et la panne du 2023-03-24 12:39Z sur les 15m et 1h de 2023-03, WARM-2) ; blocs 2022-09 → 2024-09 : 292/300, 0 manquante.
  Item RECORDER-CLOSE-TIME-1 (successeur de l enregistreur : garde et liste les clôtures irrégulières, ne s arrête que sur la grille ; rejeu
  EE-3 au bit sur un mois scellé ; ré-enregistrement des 153 mois) : GO de l investisseur le 2026-10-02 à 19:21 UTC (verbatim : « go pour
  l enregistreur successeur, demain après la publication ») ; déclencheur : après la première publication du Dōjō, avant P0-2. W2-S-SIM-1.
  Addendum 1 de l ADR 0006 (règles 1 à 8) relu CONFORME le 2026-10-02 19:34 UTC (PR recherches#57) ; règle 8 précisée sur les octets du
  2023-03-24 (reprise 14:00Z, 0 trade 11:30 à 12:29) ; 8 bis `zero_trade` et instance de lieu attendus de RECHERCHES ; manifeste du successeur
  à porter `zero_trade`. Les tables de puissance peuvent être calculées sur les règles 1 à 7.
  Chantier L2 (go investisseur 2026-10-03 00:2x UTC, « maintenant ») : RECORDER-L2-1 (carnet spot ±100 pb, meilleur prix, transactions,
  différences BTC/ETH si tenable), RECORDER-LIQ-1, RECORDER-OI-1 (5 min), RECORDER-EXCHINFO-1 (quotidien), RECORDER-L2-REGION-2 (second
  hôte, autre région, identité à l octet) ; différés RECORDER-FUNDING-1, oracle, diffs BNB/SOL. Préalables : FAITS-L2-ACCESS-1 (conditions,
  région de l hôte, points d accès, Q-6 à Q-10) avant tout appel ; hôte = serveur du site sous quota ; audit advisor marché (0007-AVIS) plié.
- **ADR de la vague 2 ACCEPTÉ par le fondateur** (v8.1, 2026-10-02 ; empreinte du texte accepté `fe48c03a33da7ab0090b97a41b911f74102de61fa6059188e1c01d23a8fb4be6`,
  relevée sur place à 19:13 UTC, pour P0-2 ; checkpoint-1 MONARK ACCEPTE-AVEC-CORRECTIONS plié). Parties : A W2-E + W2-S (MONARK après le
  chantier 2), B W2-H + W2-L, acte P0-2, C W2-C + W2-F, D course 2b. Dû par MONARK : C-3 (diff A-1) au début de W2-E ; C-6 (FAITS) avant P0-2.
  LIVE-2-RECORD-1 (conditionnel : si P0-2 vient après la première lecture de LIVE-1 par RECHERCHES, MONARK enregistre LIVE-2, premier
  trimestre civil complet après P0-2, scellé ; C-5 du checkpoint-1 v6). Checkpoint-1 v6 rendu le 2026-10-02 à 18:49 UTC :
  ACCEPTE-AVEC-CORRECTIONS (C-1 à C-10 ; rapport `F:/tmp/kata-w2v6/cp1/CP1-W2-RAPPORT.md` sha256 `c01df603…`, 17 recalculs égaux).
- Page servie dès la première publication, pas avant, et sous le bloquant de TU-7 (ligne datée d ADR-DOJO-PR-3, 2026-10-02 08:56 UTC :
  premier `snapshot` servi, CA-1 verte, annonce de l investisseur, second cp-1 bref ; le lever est une décision de l investisseur).
- **Poussière** (investisseur, 2026-10-01 17:3x UTC, mot pour mot : « il faut exclure les comptes de moins de 1$ » ; option « Masquer
  dès le 1er prix », DOJO-TABLE-DUST-HIDE-1) : sous une version de prix, la table ne liste pas une ligne sous le seuil de poussière ;
  la ligne reste publiée et la recherche la trouve ; avant la première version, tout est listé, avec une phrase. Jamais le mot
  « dollar » sur la vitrine.
  - Décision de l'orchestrateur (2026-10-01 19:0x UTC, relecture G2 de SITE-PREP, C-1 voie (a) et N-3) : une ligne est masquée
    seulement si sa valeur du jour est connue et sous le seuil ; une ligne sans lecture concordante du jour reste listée (elle n'est
    pas connue sous 1 $) ; les lignes `program` sont masquées aussi (lecture littérale de « les comptes ») ; réversible à la
    validation visuelle (prix : une condition et deux phrases ; item DOJO-TABLE-PROGRAM-DUST-1).
- **Relecture G2 du site** (SITE-PREP `494eaffd`, rapport `eb6871c4…`, oracle G2 sortie 0, R-25 = 661) : APPROUVE-AVEC-CORRECTIONS.
  - Tour SITE-CORR en cours : C-1 (masque ci-dessus), C-2 (la recherche du composant cherche dans toutes les lignes, épinglée),
    C-3 (commentaire de la CLI), N-1 (gabarit `{nom}` brut refusé à la construction), N-6 (provenance des composants) ; ensuite
    G2 ciblée, `red-proof`, oracle, G7, fusion dans `lot/page-v1`.
  - N-2 mesuré (45 essais : un abandon n'a jamais de code), sans correction.
  - Items : DOJO-COPY-HOLDERS-MISSING-DAY-1 (phrase `holders`, à la validation des textes) ; DOJO-TABLE-STATUS-ANNOUNCE-1
    (recherche : annonce des régions `role="status"`, au volet navigateur) ; DOJO-COPY-DURATIONS-DERIVED-1 (durée de Migration
    littérale, avant toute ancre où elle diffère de 180) ; DOJO-VERIFY-URL-IDLE-MEASURE-1 (avant CA-1 de la partie 3).
  - Avant l'envoi du site restent : jambe 2 de DOJO-LOOKUP-PAYLOAD-1 et volet navigateur de DOJO-LIVE-RENDER-ORACLE-1 (le 2 octobre),
    la validation visuelle des textes par l'investisseur (dont `tableDust`, `tableNoVersion`, TXT-5 « committed in advance »).
- **Course d'historique provisoire** (orchestrateur, 2026-10-01) : elle tourne depuis `F:/Monark-wt-page-v1` au commit `c2bcde20`
  (HISTORY-INS), et non au commit G7 `c0c60617` que nomme le mode d'emploi (section 18 (i)). Motif : la première course s'est arrêtée
  sur `instruction_not_allowed` (`initializeAccount` ×3 et `approve` ×1 sur le mint, aucun ne change un solde) ; HISTORY-INS les
  admet (relecture G2 ciblée APPROUVE-AVEC-CORRECTIONS, aucune ligne exécutable à changer). État neuf `provisional-2026-10-01-r2`,
  coupe 452362695 ; les arbres de l'hôte ne changent pas (la course tourne sur la machine de l'opérateur).
  Seconde course arrêtée en phase C à 19:57 UTC (`withdrawExcessLamports` ×5, 2 574 comptes fermés) : correction HISTORY-INS-2
  en cours, puis course neuve. Départ au plus tard avant 00:15 UTC du 2 octobre (jour o planifié avec sa balise : d = 2 octobre) ;
  au-delà, un jour de plus (d = 3 octobre).
  HISTORY-INS-2 commis (`0b3c02b3`, `withdrawExcessLamports`, `amountToUiAmount`, `uiAmountToAmount` ; `reallocate` écarté) ; G2
  ciblée APPROUVE-AVEC-CORRECTIONS, code tel quel, C-1 faite (lignes datées de l'ADR, `dfd9f873`) ; troisième course lancée à 20:45 UTC
  (coupe 452391928). Item DOJO-HISTORY-BATCH-NEAR-1 (un `batch` analysé n'est pas jugé par la liste fermée ; la proximité testée à toute
  profondeur, deux ou trois lignes et un test) : avant la course finale du 3 octobre ; FAITS-TOKEN2022-PARSER-REALLOCATE-1 : au premier
  arrêt qui nomme `reallocate`.
  Troisième course ralentie par l'opérateur (appels à 608 ms contre 315 ms l'après-midi) : liste prête vers 01:30 UTC le 2 octobre.
  Décision de l'investisseur (21:4x UTC, « Page le 4 octobre (Recommandé) ») : ordre du mode d'emploi gardé, rien de forcé ; départ
  et minuterie le 2 octobre dès la liste déposée ; premier jour compté le 3 octobre ; première publication le 4 octobre.
  **Fait** : la course a fini à 23:06 UTC le 1er octobre (débit revenu), donc l'ordre du mode d'emploi, gardé, a donné mieux : liste
  déposée (284 adresses, `cb3d23b1…`), départ sur J et minuterie à 23:07 UTC, plan du 2 octobre fait avec sa balise à 00:00 UTC.
  **Premier jour compté : 2 octobre ; première publication : 3 octobre.** Avant la course finale : DOJO-HISTORY-BATCH-NEAR-1
  (livré par le G1, commit `40f11dc7` sur `lot/batch-near` ; mesure sur r2 et r3 : 0 instruction proche par la seule règle profonde ;
  G2 ciblée APPROUVE-AVEC-CORRECTIONS, code tel quel ; fusionné dans `lot/page-v1` = `2fab0d81`, avec ses lignes d ADR ; G7 : oracle
  `02104bde…` sortie 0, 1 872 tests, 0 rouge, R-25 168, arbre = commit).
  DOJO-TASKSMAX-SAMPLE-D-1 fait (pic 11 sur 64 pendant une lecture du 2 octobre ; pic 7 à A-5) ; ligne datée
  d'épingle dans ADR-DOJO-PR-3 avec la fusion. A-10 fait le 2 octobre à 01:4x UTC (minuterie de publication active ; jusqu'à la
  ligne d'historique, chaque créneau rend `history_missing` sans rien écrire).
  A-1 fait le 2 octobre (00:3x UTC) par l'investisseur : `dojo.monarkgate.tech` (A, TTL 300) vers l'hôte Bell, vérifié aux deux serveurs
  faisant autorité ; rien n'est servi sous ce nom avant le site Caddy de l'hôte (A-6).
- **Partie 3, G7 ACCEPTÉ le 2026-10-02 à 14:31 UTC** (orchestrateur Fable 5.1 ; `lot/page-v1` `f39e679c`, oracle `581c62c5…` sortie 0, 1 882 tests,
  0 rouge, R-25 1 130 ; G2 `ba7514c8…`, checkpoint `aca2af79…`, corrections 1 à 5 faites). Reste : accord de l investisseur sur la
  partie (décision 300), fusion par pas au tronc, actes A-6, CA-1, §24, TU-7. Additif 1 de l ADR 0005 des katas accepté par l investisseur.
- **Partie 3, checkpoint** (rapport `ad2b8674…`, ACCEPTE-AVEC-CORRECTIONS) : `lot/site-prep` (`9abecbf8`) réuni à `lot/page-v1`
  (`d1120612` ; G7 : oracle `f553542d…` sortie 0, 1 869 tests, 0 rouge, R-25 873).
  Conditions d'envoi du site (C-V-1, décidées par l'orchestrateur le 2026-10-02, 01:0x UTC) :
  - faits : A-1 (DNS) ;
  - le 2 octobre, orchestrateur : DOJO-SITE-PROXY-XFF-1 GARDÉ comme condition (lot SITE-SEND-PREP : aucune adresse que Caddy écrit
    n'atteint l'hôte de la clé, `X-Real-IP` et `Forwarded` retirés tels qu'envoyés, tout autre en-tête passe : DOJO-SITE-PROXY-HEADERS-
    ALLOWLIST-1 ; trois traversées attendues 404 à l'acte, preuves de la liste fermée ; deux variantes observées, non probantes) ; volet navigateur et jambe 2
    (lot SITE-BROWSER, mesure
    mobile contre le budget des FAITS) ; validation visuelle de l'investisseur (C-V-4, liste fermée du rapport, réponses mot pour mot) ;
  - à l'acte, orchestrateur : A-6 (site Caddy de l'hôte), DOJO-EDGE-CACHE-1 (le DNS de `monarkgate.tech` pointe droit sur le VPS,
    sans bord ; en-têtes mesurés), puis DOJO-SITE-PROXY-1 ;
  - le 3 octobre, orchestrateur : première synchro, `dojo-served.json` committé, oracle G7 ; le registre `hold-snapshot` ne passe à
    « built » qu'alors (C-V-5) ; PAROXYSME-DOJO-FILE-1 : registre `docs/PAROXYSME-Dojo.md` versé le 2 octobre (`25dd9dd3`,
    151 limites, 34 dettes sans item dont 6 publiques) : les 34 items sont à former avant cette synchro ;
  - reportés après la première publication, par l'orchestrateur : DOJO-LIVE-HEALTH-1 (sonde quotidienne ; en attendant, l'orchestrateur
    rejoue `dojo-verify-cli --url` sur l'hôte servi après chaque publication ; déclencheur : avant le jour de l'annonce ou sous 7
    jours), DOJO-HEAD-RULES-ONE-SOURCE-1 et DOJO-LOADER-RULES-AST-1 (au registre PAROXYSME), DOJO-VERIFY-URL-IDLE-MEASURE-1 (avant CA-1).
  - à l'envoi, orchestrateur (N-8 de la G2 de la partie 3, 2026-10-02) : SITE-BUILD-LOCAL-ROOT-UNSET-1, la construction de production
    est faite sans `MONARK_DOJO_LOCAL_BUILD_ROOT` (variable absente de l'environnement de la construction, relevé au JOURNAL) ; acte du
    mandataire DOJO-SITE-PROXY-1 au mode d'emploi (tour de corrections de la partie 3) ; validation visuelle C-V-4 et Q-4 du navigateur
    (budget mobile de laboratoire rouge) tranchées par l'investisseur.
  - C-V-2, Q-3 décidée : la cohérence entre `holder_counted` et `day_value` est le rôle du vérificateur (lignes signées et relues),
    pas de la table (avis (a) de la G2). C-V-3 : commentaire de `DOJO_TABLE` corrigé dans SITE-SEND-PREP.
