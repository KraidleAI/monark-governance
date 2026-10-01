# ÉTAT — page snapshot du Dōjō (repartir du code)

Écrit le 2026-09-30 à 23:5x UTC, après vérification du code, des branches et des tests ; mis à jour le 2026-10-01 à 05:1x UTC.

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
  - documentation : la ligne TU-1h d'ADR-DOJO-PR-3 dit `readings/` seul, le code exige le jour clos entier.
- **Recherche du tableau** : elle contrôle l'alphabet base58, pas le décodage en 32 octets ; accepté à l'inspection (rendu sûr).
- **Textes du tableau** : TXT-17 et TXT-17a corrigés et TXT-17o ajouté (« Listed by hold score, highest first; equal hold scores by address. »), à valider par l'investisseur avec la page.
- **Adresse du serveur Bell** : déjà dans le dépôt public (19 fichiers de `main` depuis le 23/09, et le mode d'emploi du Dōjō). Ce n'est pas un secret : `bell.monarkgate.tech` y renvoie. Aucune clé n'est publiée.
- **Collecteur d'historique** : il lit encore les réponses sans borne de taille (`history-collect.ts` l.408-409). À borner avant le premier acte d'historique, après mesure de la plus grosse page (item RPC-GUARD-BODY-BOUNDS-ALL-1).
- **SIGTERM** : la variante par vrai signal du test est sautée sous Windows ; à prouver sur Linux (item DOJO-SIGTERM-LINUX-PROOF-1).
- **Mode d'emploi** : une commande de la section 9 tient sur une ligne de 629 caractères (une commande par ligne) ; exception déclarée.
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

- Site envoyé depuis un commit validé du tronc ; `main` (808 commits de retard) est intégré après la page.
- Page servie dès la première publication.
