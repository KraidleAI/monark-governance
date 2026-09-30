# ÉTAT — page snapshot du Dōjō (repartir du code)

Écrit le 2026-09-30 à 23:5x UTC, après vérification du code, des branches et des tests.

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
- Aucun secret ni adresse IP d'hôte publiés.
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
  - unités de publication, Caddy de l'hôte et mode d'emploi (`lot/dojo-pr3b2`) ;
  - tableau et recherche (`lot/dojo-pr4c2`) ;
  - publication de l'historique (`lot/dojo-pr3a2`) ;
  - plans de trois correctifs : grand livre `rpc-guard`, écrivain unique, relais drand.
- **Déjà livré et réuni sur `lot/page-v1`** : la garde de lancement des programmes de l'hôte.

## Ce qui reste pour la page

1. **Partie 1, code** : finir les pièces en cours, les réunir sur `lot/page-v1`, une inspection, fusion au tronc.
2. **Partie 2, mise en service sur le serveur Bell** : utilisateurs, arbres, clé, unités, ancre signée, jour zéro de collecte (l'historique a besoin d'un premier jour clos), actes d'historique, premier jour compté, première publication.
3. **Partie 3, site** : synchro des données, mandataire, envoi du site, validation visuelle de l'investisseur.

## Choix de travail actuels (révisables)

- Site envoyé depuis un commit validé du tronc ; `main` (808 commits de retard) est intégré après la page.
- Page servie dès la première publication.
