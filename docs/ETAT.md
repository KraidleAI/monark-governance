# ÉTAT — page snapshot du Dōjō (repartir du code)

Écrit le 2026-09-30 à 23:5x UTC, après vérification du code, des branches et des tests ; mis à jour le 2026-10-01 à 00:3x UTC.

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
- **Code en cours (partie 1)**, une branche par pièce :
  - relais drand pour le premier pas réel (`lot/drand-1b`, plan fait, code en cours) ;
  - grand livre `rpc-guard` : grand livre neuf, corps borné pour le collecteur, relevés entiers (`lot/rpcguard-first`, code en cours) ;
  - écrivain unique de l'éditeur, `--unlock` explicite (`lot/single-writer`, code en cours).
- **Déjà livré et réuni sur `lot/page-v1`** (tête `8aaba460`) :
  - la garde de lancement des programmes de l'hôte ;
  - les unités de publication (minuterie 00:30, 01:30, 03:30, 06:30 UTC), le Caddy de l'hôte, les constantes de déploiement et le mode d'emploi, avec le jour zéro gardé ;
  - la publication de l'historique par l'éditeur (`--history`, vérifiée avant engagement, quatre refus nommés) ;
  - le tableau de toutes les adresses, classé par score décroissant (égalités par adresse), avec la recherche locale d'une adresse ;
  - corrections d'assemblage : mode d'emploi des refus de l'historique (section 19) et de l'acte `--history` (section 18) ; le test `evidence/` ne prend plus un nom de clé du manifeste pour un chemin.
  - Tests du Dōjō et de la page sur la branche réunie : 217, dont 216 verts, 0 rouge et 1 ignoré (il attend la clé du serveur).

## Points connus (à traiter, non bloquants sauf mention)

- **Charge mesurée de la publication** : 80 s pour 1 144 adresses sur 30 jours, 559 s sur 365 jours, 562 s pour 10 000 adresses sur 30 jours. Limites de l'unité : `TimeoutStartSec=2900`, `MemoryMax=512M`. Au-delà d'environ 10 000 adresses sur un an, il faudra revoir la vérification avant écriture.
- **La CLI du vérificateur en `--url`** rend `unreachable` si le serveur ferme une connexion inactive pendant un long calcul. La vérification sur une copie locale n'est pas touchée.
- **Mode d'emploi** : les copies se comparent sur l'empreinte seule (64 caractères), car `sha256sum` sous Git Bash ajoute ` *`.
- **Unité** : deux directives systemd dépassent 160 caractères, sans coupure possible.
- **Vérificateur, à corriger avant l'inspection** : un nombre non fini (`1e400`) dans une ligne d'historique le fait échouer sans refus nommé (`non-finite number in digest`). Rien n'est écrit.
- **À trancher à l'inspection** : un fichier étranger sous `publish/` du paquet d'historique est ignoré, pas refusé ; aucune garde « dernier jour d'historique révolu » dans l'éditeur ; le test de la liste des refus suppose un seul site `refuse(e.code` ; la recherche contrôle l'alphabet base58, pas le décodage en 32 octets.
- **Textes du tableau** : TXT-17 et TXT-17a corrigés et TXT-17o ajouté (« Listed by hold score, highest first; equal hold scores by address. »), à valider par l'investisseur avec la page.
- **Adresse du serveur Bell** : déjà dans le dépôt public (19 fichiers de `main` depuis le 23/09, et le mode d'emploi du Dōjō). Ce n'est pas un secret : `bell.monarkgate.tech` y renvoie. Aucune clé n'est publiée.

## Ce qui reste pour la page

1. **Partie 1, code** : finir les pièces en cours, les réunir sur `lot/page-v1`, une inspection, fusion au tronc.
2. **Partie 2, mise en service sur le serveur Bell** : utilisateurs, arbres, clé, unités, ancre signée, jour zéro de collecte (l'historique a besoin d'un premier jour clos), actes d'historique, premier jour compté, première publication.
3. **Partie 3, site** : synchro des données, mandataire, envoi du site, validation visuelle de l'investisseur.

## Choix de travail actuels (révisables)

- Site envoyé depuis un commit validé du tronc ; `main` (808 commits de retard) est intégré après la page.
- Page servie dès la première publication.
