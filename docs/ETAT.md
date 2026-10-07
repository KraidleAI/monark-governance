# ÉTAT — page snapshot du Dōjō (repartir du code)

Écrit le 2026-09-30 à 23:5x UTC, après vérification du code, des branches et des tests ; mis à jour le 2026-10-02 à 02:2x UTC ; points de RECHERCHES du 2026-10-05 à 22:1x UTC (section « Point du 2026-10-05 au soir » et items).

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
- **Écart au plan du mois (RECHERCHES, 2026-10-06, après T0 ; consigne « si une étape ne tient pas, dis-le tout de suite »)** : la mise
  en service de la **vague 1** ne dépend d'aucun maillon de la vague 2 ; elle attend le chargeur des lignes engagées (E-2a),
  VERIFIERS-LIST-F5A-1 (MONARK) et SHORT-DIGEST-INVERSION-1 (RECHERCHES) ; visée vers le 2026-10-20. La mise en service de la
  **vague 2** ne tient pas dans le mois : FORMAT-W2, P0-2, la course et la recomputation aveugle la portent au plus tôt vers le
  2026-11-05, et ADR 0006 D6 interdit tout service avant ENGINE-ROW-RETIRE-PATH-1 livré et mesuré. Le mois livre le registre de
  vague 2 vetoé et son rapport (repli D8, Q-W2-24) ; service visé : 2026-11-16. Dates accordées par MONARK (vague 1 vers le 2026-10-20,
  vague 2 visée au 2026-11-16) ; MONARK écrit qu'il en prévient l'investisseur le 2026-10-06 (Q-E9, recherches `034a528`).
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

## Point du 2026-10-05 au soir (RECHERCHES, 22:1x UTC)

- **Moteur 1.1.0 (base `base/chantier-moteur-2026-10-03`)** : blocs A, B1, B2, C (C1, C2), C' (3c-4a, 3c-4b) et D (D-1 #169, D-2 #171,
  D-3 #172) fusionnés ; base `21a379fc` puis la ligne (12) d ADR-CM de MONARK. Dernier oracle Windows : 2 571 tests, 0 échec (record
  `f5eaf514`). Le bloc E (CM-4c) : E-1 (table mixte, ~505 lignes, coupe E-1a / E-1b, après FORMAT-W2) et E-2 (chargeur des
  lignes engagées, ~235 lignes : E-2a vague 1, E-2b vague 2 sous condition) ; G0 accordé par MONARK le 2026-10-06 (`ff2d4cd`).
- **Tronc `lot/etude-suite` `74120213`** : gardes R-25 #162, #166, #170, #173 et #177 (R25-ASSET-STRUCTURE-1, fusionnée le 2026-10-05 ;
  oracle Windows 2 495 tests, 0 échec). Synchro tronc → base en cours (branche `base/sync-tronc-2026-10-05-soir`).
  Garde CodeQL du tronc : l analyse de `e4aac057` a été annulée (incident GitHub Actions) ; elle se ferme à la prochaine analyse aboutie.
- **Miroir public `KraidleAI/Monark`** : dernière release v0.8.0 (2026-10-04 14:39 UTC). Deux chemins pour la suivante :
  (a) **depuis le tronc**, possible avant T0 (arbre sans instantané en attente) ; contenu : les gardes R-25, la suite L2 P1, les correctifs
  d aléas ; ne porte pas le contrat 1.1.0 ; (b) **depuis la base, à T0 seulement** (garde `export-public --out`, RUNBOOK) : le contrat 1.1.0.
- **Reste avant T0 (chemin b)** : SCHEMA-PROJECTION-FAIL-CLOSED-1 (PR #180) et RELEASE-PREFLIGHT-SEND-GUARD-1 (PR #181), vers la
  base, G2 neuves pliées, CI vertes ; synchro tronc → base faite (#179, base `789f6511`) ; CI-WORKFLOWS-SET-1 passe après T0 (PR #182,
  accord de MONARK : garde de CI) ; CI-PERMS-JUDGE-YAML-1 passe après T0 (accord de MONARK : garde de CI, pas un contrat
  servi ; contrôle par diff des fichiers de la gate par MONARK d ici là ; déclencheur : la première semaine après T0) ; NOTICE-1-1-0 finalisée (cellule V-1 à V-8 faite ; N-5 à ajouter : noms BYO
  génériques réservés ; empreinte OpenAPI `61c9df97…`) ; acte de porte de MONARK (genre « avis », `{SPEC_URL}`, date de T0) ; synchro
  tronc → base ; liste de T0 de MONARK (CONTRACT-1-1-0 plus bas).
  - Ligne datée 2026-10-06 (RECHERCHES, lot T0-TOOLING-1, m-d de la relecture des actes de T0) : RELEASE-PREFLIGHT-SEND-GUARD-1 est livré par #181 (refus au pré-vol de `scripts/release-public.mjs`, avant toute porte ; depuis T0-TOOLING-1, avant toute lecture `gh`) ; il ne reste plus avant T0. SCHEMA-PROJECTION-FAIL-CLOSED-1 (#180) est livré lui aussi.
- **Décision du fondateur (2026-10-05 22:1x UTC, verbatim : « oui, on fait tout en un seul release, ensuite on continue le prochain
  chantier. donc demain on mets a jour tout. »)**, en réponse à la proposition D = 0 de RECHERCHES (personne n utilise le moteur 1.0.0 ;
  mesure : 4 `POST /gate` de 2 clients sur les 7 jours avant le 2026-10-03). Conséquences :
  - **D = 0** : plus de préavis de 7 jours (« actes 2 et 3 (T − D, D = 7 jours) » du G0 du bloc C) ; la NOTICE-1-1-0 devient la note de
    version du 1.1.0, publiée le jour de T0 ;
  - **une seule release** du miroir, à T0, depuis la base fusionnée au tronc ; pas de v0.9.0 séparée avant ;
  - **T0 visé : 2026-10-06**, quand la liste « avant T0 » ci-dessus est fusionnée ; ensuite, le chantier suivant ;
  - **lieu de la spécification** : décision du fondateur (2026-10-05 22:3x UTC, option retenue verbatim : « Créer monark-kata-spec
    (Recommandé) ») : le dépôt public `KraidleAI/monark-kata-spec`, que vise déjà `scripts/spec-publish.mjs` (SPEC-PUBLISH-PIPELINE-1)
    et que nomme le message servi `gate.ts:902` ; rien à recoder. Le dépôt existe déjà (public depuis le 2026-10-01 : `KATA-SPEC.md`,
    vecteurs et rapport de la vague 1 ; vérifié par MONARK à 23:01 UTC) : aucun dépôt n est créé. D = 0 confirmé par l investisseur
    dans le fil de MONARK (23:0x UTC). MONARK étend la liste d autorisation de `public-text-deny` (V-1) avec son test.
- **Garde CodeQL du tronc** : fermée (analyse de `74120213`, 0 alerte ouverte).

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
  Trois morts de plus le 2026-10-03, hors oracle, jamais comptées « tuées » : `test/record-coinbase-candles.test.ts` sous un mutant de
  la comparaison (re-revue de COINBASE-ADD7-1, RR-2) ; `test/h5-e2e-probe.test.ts` sous M31 (G2 de CM-1, section 2.4) ; l'enfant `gel`
  d'une preuve rouge du correcteur de BINANCE-PRE153-1 (22:25:57Z, 0xC0000409 à 302 ms, preuve rendue REFUSE, relancée dans un dossier
  neuf : `ok` ; `bnpre/corr/CORR.md` l.109 ; RED-PROOF-CHILD-STDERR-1 : l'outil ne garde pas la sortie d'erreur de l'enfant).
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
- **Items de méthode de la partie du site, formés le 2026-10-03 à 08:37 UTC** (correcteur DOJO-SITE-PART-CORR-1, `claude-opus-5-5`, décision D-4 de
  l'orchestrateur ; G2 de la partie, `F:/tmp/dojo/g2-partie/G2-RAPPORT.md`, sha256 `df4f335e…` ; propriétaire : orchestrateur) :
  - METHODE-SITE-BUILD-CLONE-1 (outillage) : `npm run build -w @monark/site` échoue sur un clone à jonctions, car `node_modules/next` y est
    une jonction hors de la racine que Next déduit. Source : journal G1 de DOJO-NAV-LINK-1 (`F:/tmp/dojo/nav/G1-DOJO-NAV-LINK-1.md`,
    `a6e6a3f8…`) l.116-121 et E-2 l.216-225, quatre options ; G2P-4. Déclencheur : prochain G1 ou G2 d'un lot qui touche `apps/site`. État :
    ouvert ; d'ici là, build du tronc après fusion (option (b)) ; option (a) proposée : `npm ci --offline` dans le clone.
  - MK-NM-GUARD-1 (outillage) : `F:/tmp/dojo/drand-1a/mk-nm.ps1` (`d70d8aea…`) vide d'abord le `node_modules` de sa cible par `rm-nm.ps1`
    (l.8) ; lancé sur `F:/Monark`, il a vidé celui du tronc le 2026-10-03 (HANDOFF-2026-10-02 l.458-460). Item : le script refuse toute
    cible égale au tronc, source de ses jonctions (l.5). Déclencheur : avant le prochain lancement de `mk-nm.ps1` hors d'une enveloppe à
    garde de chemin. État : ouvert ; d'ici là, enveloppe gardée (modèle : `prep-nm.ps1` de la G2 de la partie, `5f5c7952…`).
  - RUNBOOK-VITRINE-TAR-ORDER-1 (mode d'emploi) : la commande `tar` de sauvegarde de `docs/RUNBOOK-vitrine.md` l.12 place ses deux
    `--exclude` après le membre `monark-app` ; jugée fautive à l'envoi du 2026-10-03, sauvegarde refaite (HANDOFF-2026-10-02 l.455-456).
    Déclencheur : avant le prochain envoi du site. État : clos le 2026-10-03 09:1x UTC (preuve : `docs/RUNBOOK-vitrine.md`, ligne datée ;
    GNU tar 1.35 lu sur le serveur, ordre fixé sur la mesure). Manuel en ligne non lu : 403 au navigateur interne, extension refusée
    dans Chrome, non contourné ; procurement : aucune autre source requise, la mesure suffit à la ligne.
  - GOV-MAIN-DIVERGENCE-1 (dépôt) : `origin/main` de `monark-governance` (207f021f, 2026-10-01) porte 47 commits absents du tronc
    `lot/etude-suite` (chantier 2, moteur w2 : `packages/hikae`, PR #101 et #102) ; le `main` local avancé le 2026-10-03 sur le tronc
    en diverge. Déclencheur : avant tout travail du chantier 2 ou de W2-E, et avant toute poussée du dépôt de gouvernance. Suite : fusion
    de `origin/main` dans le tronc, oracle G7, puis décision de l investisseur sur la poussée. État : clos le 2026-10-03 (fusion
    404480e8 ; poussée en branche base/chantier-moteur-2026-10-03 sur décision de l investisseur ; main de gouvernance inchangée).
  - PS-C-WRITE-1 (recherche ; proposé par `docs/G1-lot-page-fold.md` l.180 ; le fait est admis plus haut, CV4-POWERSHELL-C-WRITE-1) : tout
    `powershell.exe` imposé (C-V-4 par `Get-CimInstance`, `mk-nm.ps1`, `rm-nm.ps1`) réécrit un fichier de profil de PowerShell sous C: ;
    G2P-6 : `-NoProfile` ne l'évite pas, d'autres processus de l'hôte le réécrivent aussi. Piste : jonctions par `fs.symlinkSync` en node,
    C-V-4 par `freemem()` et `tasklist` comme `scripts/oracle/run.mjs` l.153-156. Déclencheur : prochaine révision de la règle C-V-4 de
    REGLES-MISSION, qui nomme `Get-CimInstance`. État : ouvert.
    Alias, lots RECHERCHES du 2026-10-03 : METHODE-PS-LOCALAPPDATA-1 (I-6 ; même constat, même piste ; leur déclencheur : prochain lot de
    méthode). Mesuré : `LOCALAPPDATA` redirigé sous `F:/tmp` ne change rien (`F:/tmp/rech/ct/corr/CORR.md` l.131) ; leurs tours suivants
    ont lu C-V-4 sans PowerShell (`os.freemem`, `tasklist`, `systeminfo` pour la mémoire virtuelle, équivalence [abs] : Q-CORR3-1).
    Lots du 2026-10-03 (addendum 7, BINANCE-V2-1) : même constat pour `mk-nm.ps1`, `rm-nm.ps1` et `Get-CimInstance` (Q-CORR-2 du
    correcteur Binance, E-2 du correcteur EE-7) ; piège mesuré : sous Git Bash, `tasklist /FI` voit son argument converti en chemin et
    compte 0 `node.exe` (O-CTV2-1 ; E-3 du correcteur Coinbase) ; `MSYS_NO_PATHCONV=1`, ou `execFileSync` comme l'oracle, le rend juste.
- **Items des lots RECHERCHES USDT/USD et Binance, 2026-10-03** (lots COINBASE-USDT-RECORDER-1, EE7-HISTORY-DETECTOR-1 et
  RECORDER-CLOSE-TIME-1, fusionnés au tronc `c26ec2af` ; sources : journaux et revues sous `F:/tmp/rech/`, dossiers `cb`, `ee7`, `ct` ;
  I-1 à I-8 : numéros du lot RECORDER-CLOSE-TIME-1 ; recensement complet, clos et absorbés compris, avec preuves :
  `F:/tmp/rech/items/JOURNAL.md` (empreinte : `F:/tmp/rech/items/DELIVERED.sha256`) ; propriétaire : orchestrateur, sauf mention) :
  - FAITS-COINBASE-CANDLES-1 (lecture formée) : lire sur place la forme des dates (H-1), l'ordre (H-3), les en-têtes de limite (H-6),
    les statuts (H-7) et le `User-Agent` (H-8) de l'API Coinbase ; la partie 4 du FAITS USDT-USD (bornes) est faite. Source :
    `cb/corr/CORR.md` l.290-292, `cb/corr2/CORR2.md` l.388-389. Déclencheur : avant la première requête Coinbase ; état : ouvert.
  - COINBASE-BOUNDS-READ-1 (mesure) : lire les compteurs de marge du premier mois réel contre la table des signatures mesurée, puis
    dater au FAITS la lecture des bornes du serveur. Source : `cb/corr/CORR.md` l.293-297, `cb/corr2/CORR2.md` l.308-332 et l.385-387.
    Table de la passe 2 mesurée par COINBASE-ADD7-1 (`cbadd7/G1.md` l.295-313, item 6) : au premier mois, les compteurs des deux passes
    sont lus contre la lecture que la sonde aura nommée (COINBASE-PROBE-RUN-1). Déclencheur : premier mois enregistré ; état : ouvert.
    Ajout de COINBASE-PASS-EDGES-1 (`cbedges/G1.md` l.338-339) : lire aussi la taille des pages réelles (`bytes` de `requests.jsonl` du
    premier mois) contre `BODY_MAX` (65 536 octets ; borne posée sur un modèle de nombre, la forme réelle des nombres de Coinbase
    n'étant pas documentée : `cbedges/G1.md` l.130-138) ; une page proche de la borne rouvre Q-E-7 ; aucun code.
  - COINBASE-RATE-HEADERS-1 (enregistreur) : fermer la liste des en-têtes de limite journalisés d'après les noms reçus au premier mois.
    Source : `cb/G1.md` l.374-375. Déclencheur : premier mois enregistré ; état : ouvert.
  - COINBASE-TRUNCATION-RESIDUAL-1 (PAROXYSME, mesuré) : une page tronquée du côté que la marge voisine ne témoigne pas, ou une bougie
    omise dans un coeur, sort 0 avec des faux manquants ; minimum : seconde lecture décalée du mois 1, comparée au CSV (étape (c'), RR2-1) ;
    fermeture : double lecture chaque mois. Source : `cb/corr2/CORR2.md` l.373-384 et l.436-453, `cb/rr2/G2-RAPPORT.rr2.md` l.214-248.
    Déclencheur : avant la boucle des 49 mois, qu'il bloque (Q-C2-8) ; état : ouvert. Construction faite au code par COINBASE-ADD7-1
    (addendum 7 R1 : `--pass 2` décalée d'un demi-coeur, `compare-coinbase-passes.mjs`, arrêt `passes_disagree` ; plan : chaque mois lu
    deux fois ; fusion `09ed61c5`), non encore courue ; résidu mesuré : COINBASE-PASS-SHARED-BOUND-1 (ci-dessous), clos le 2026-10-04
    par COINBASE-PASS-EDGES-1 (fusion `44d8892d`) ; clôture : Q-2 de `F:/tmp/rech/itemsadd7/JOURNAL.md`, décidée : ouvert jusqu'au
    premier mois lu en deux passes (HANDOFF du tronc, 2026-10-03 21:31 UTC).
  - COINBASE-HOLE-WINDOW-1 (PAROXYSME) : sous les lectures B ou C, un trou d'au moins une requête (75 h sans échange) arrête le mois en
    `window_not_served` au lieu de l'écrire. Source : `cb/corr2/CORR2.md` l.368-372. Déclencheur : signature B ou C au premier mois, ou
    un mois arrêté `window_not_served` (Q-C2-6) ; état : ouvert.
    Depuis COINBASE-ADD7-1, sous les autres lectures, une page vide arrête le mois `empty_page` (`cbadd7/G1.md` l.370-371, l.431-432) ;
    joindre à cette question pour RECHERCHES : une page au coeur vide qui sert une marge compte 298 manquants et sort 0, vue par la
    seconde lecture (G2-12) ; `empty_pages` vaut 0 dans tout manifeste écrit, le compte vit dans le détail de l'arrêt (G2-6).
    Depuis COINBASE-PASS-EDGES-1 (fusion `44d8892d`), en passe 2, une page vide de témoins seuls, après un coeur qui tient la fin du
    mois au milieu de sa requête, est comptée (`empty_witness_pages`) sans arrêt : règle de RECHERCHES du 2026-10-03 (réponse à Q-5,
    section 2, `fe23c555...`) ; `record-coinbase-candles.mjs` l.293-294, tests l.851 et l.863.
  - COINBASE-MUTANTS-CORR-1 (mutants) : campagne de fusion par `scripts/mutants/run.mjs` sur un clone ; survivants connus W10 (détail
    `first`), G02 et G03 (garde d'exécution ; G03 non équivalent sous `--preserve-symlinks-main`). Source : `cb/corr3/CORR3.md` l.277-283
    et l.302-319, `cb/rr3/G2-RAPPORT.rr3.md` l.74. Déclencheur : fusion du lot, atteint (`fca34dc2`) ;
    campagne de fusion faite le 2026-10-03 (`F:/tmp/rech/mutfusion/`, section 5) : W10, G02 et G03 survivent, non équivalents,
    tueurs mesurés, prix environ 13 lignes ; à tuer au tour de corrections du lot COINBASE-ADD7-1, qui touche l'enregistreur (le solde
    R-25 de l'ancien lot imposerait sa scission) ; état : clos le 2026-10-03 : W10, G02 et G03 tués au tour de corrections de
    COINBASE-ADD7-1 (`F:/tmp/methode/cbadd7/mut-1/RESULTS.json` `539ae87b...`, 76 sur 76, `strict` ; re-revue : rouges), tests au tronc
    (`test/compare-coinbase-passes.test.ts` l.168, `test/probe-coinbase-bounds.test.ts` l.209-235), fusion `09ed61c5`.
  - COINBASE-PLAN-ENVOK-OPENSSL-1 (plan) : le contrôle `envok` du plan refuse aussi tout nom `^OPENSSL_`, miroir de la garde. Source :
    `cb/corr3/CORR3.md` l.256-262 et l.284-285. Déclencheur : avant la première requête Coinbase ; état : clos le 2026-10-03 : le plan
    de COINBASE-ADD7-1 porte `OPENSSL_.*` dans `DENY` et `envok` le refuse (`cbadd7/G1.md` l.267-268 ; constat positif G2-14 de sa G2) ;
    la copie du plan garde ces deux lignes.
  - COINBASE-CI-LINUX-1 (CI) : le lot n'a tourné que sous Windows ; la CI `ubuntu-latest` de sa PR sera sa première course Linux.
    Source : `cb/rr2/G2-RAPPORT.rr2.md` l.282-290 et l.349-350. Déclencheur : la PR ; état : ouvert.
  - SERIES-ENV-ALLOWLIST-1 (PAROXYSME, les deux enregistreurs) : une liste de noms refusés ne se prouve pas complète ; construction :
    une liste de noms admis (`env -i` dans la boucle Coinbase ; liste blanche dans l'enregistreur Binance, alias I-5 (c), que D-4 de
    BINANCE-PRE153-1 traite avec cet item : `bnpre/G1.md` l.29). Source : `cb/corr2/CORR2.md` l.362-367, `ct/corr3/CORR3.md` l.66.
    Déclencheur : Q-C2-1, avant la boucle des 49 mois ; côté Binance, avant la course des 35. État : ouvert côté Coinbase (`guardEnv`
    refuse par nom, `record-coinbase-candles.mjs` l.148-152 au tronc `328be484`, garde que la sonde importe, l.30 et l.134 ;
    `cbadd7/G1.md` l.369). Côté Binance, **clos le 2026-10-04** par BINANCE-PRE153-1 (fusion `328be484`) : `ADMITTED_ENV`, douze noms
    (l.71) ; `guardEnv` l.146-151 : `tls_unverified` d'abord, puis `proxy_refused` pour une variable de mandataire ou un drapeau de
    node, sinon `env_refused` ; tests l.321, l.684 et l.1013 (tout nom hors des douze) ; mutants
    `F:/tmp/methode/bnpre-corr/mutants/RESULTS.json` `343e6c40...`, 100 tués sur 100. Course des 35 sous `env -i` (Q-BNPRE-4, décidée ;
    `bnpre/G1.md` l.117). Limite L-2 : les valeurs des douze noms ne sont jamais lues (item proposé SERIES-ENV-VALUES-1, `bnpre/G1.md`
    l.131 ; Q-2 du recensement).
  - SERIES-BODY-BOUND-1 (les deux enregistreurs ; étend BINANCE-BODY-BOUND-1) : le corps d'une réponse est lu en entier, sans borne
    (`arrayBuffer`) ; lecture en flux bornée, arrêt `body_too_large`. Source : `cb/G1.md` l.381-383 ; code fusionné d'alors : Coinbase
    l.154, Binance l.164 ; la sonde Coinbase aussi (`res.text()` sans borne, G2-11 de COINBASE-ADD7-1). Déclencheur : relecture de
    RECHERCHES (demandée). **Clos le 2026-10-04**, au tronc `328be484`. Coinbase, par COINBASE-PASS-EDGES-1 (fusion `44d8892d`) :
    `BODY_MAX` 65 536 (l.58), `readBody` l.175-184, arrêt l.203 avant tout arrêt de statut, la sonde par la même lecture (l.30,
    l.105-106) ; tests l.813 de l'enregistreur (dont un 503 de 70 000 octets) et l.248 de la sonde (dont un 404) ; borne mesurée :
    `cbedges/G1.md` l.130-138. Binance, par BINANCE-PRE153-1 (fusion `328be484`) : `MAX_BODY_BYTES` 262 144 (l.53), `bounded` l.253-262,
    arrêt l.240 ; test l.972 ; borne mesurée sur 1 463 pages enregistrées : `bnpre/G1.md` l.40 et l.50. Mutants : `cbedges-corr/mut-2`
    `321da4a1...`, 164 tués sur 166 (un équivalent prouvé, un non conclu sans fin) ; `bnpre-corr/mutants` `343e6c40...`, 100 sur 100. La
    relecture de RECHERCHES au nouveau sha reste un acte (actes en cours, ci-dessous).
  - SERIES-ABSENT-ROOT-TEST-1 (test ; étend BINANCE-ABSENT-ROOT-TEST-1) : la garde de sortie sur une racine absente n'est prouvée que par
    sonde ; test Windows seul qui cherche une lettre libre. Source : `cb/G1.md` l.388-390. Déclencheur : décision de l'orchestrateur ;
    état : ouvert.
  - SERIES-ERROR-BODY-1, partie Binance (enregistreur) : garder le corps d'une réponse non 200 sous `raw/errors/`, comme Coinbase ;
    absent du code fusionné d'alors. Source : `cb/corr/CORR.md` l.288-289. Déclencheur : avant la première course en ligne Binance, la
    course des 35. **Clos le 2026-10-04** par BINANCE-PRE153-1 (fusion `328be484`) : corps d'une réponse non 200 gardé sous
    `raw/errors/` (l.238-242) ; une ligne de `requests.jsonl` à l'arrivée du statut et des en-têtes (l.233-235), complétée de la taille,
    du sha256 et du fichier (l.239), comme Coinbase ; `raw/errors` n'est pas une page au rejeu (l.375) ; `logged()` n'atteste que les
    lignes complétées (l.201) ; tests l.222, l.878 et l.1094 (un 200 et un 429 coupés gardent leur ligne d'arrivée). G2-BNPRE-5 (statut
    perdu quand le corps est coupé) clos par cette ligne d'arrivée : le nom proposé SERIES-STATUS-FIRST-LOG-1 est sans objet
    (`bnpre/corr/CORR.md` l.97).
  - SERIES-PROXY-GUARD-1 (I-4, résidu) : la garde d'environnement est faite des deux côtés ; reste un appelant de `run()` dans le même
    processus, qui pourrait poser un répartiteur global avant la première requête. Source : `ct/corr/CORR.md` l.125,
    `ct/corr2/CORR2.md` l.103. Déclencheur : premier appelant de production de `run()` hors ligne de commande ; état : ouvert.
    Mesure jointe (D-7 de BINANCE-PRE153-1 ; limite L-3, `bnpre/G1.md` l.132) : dans un même processus, une requête concurrente de même
    chemin vers une autre origine fait journaliser à l'enregistreur Binance la feuille de cette origine pour sa propre page, sans arrêt
    (G2-BNPRE-3, `bnpre/g2/G2-RAPPORT.md` l.87 et l.104 ; sonde `F:/tmp/rech/bnpre/g2/probes/P2.json` `93141d1d...`) ; hors du chemin
    servi : la ligne de commande n'émet aucune autre requête ; construction rattachée à L-1 (SERIES-TLS-PEER-LOG-1) : un répartiteur
    propre à l'enregistreur, hors du `fetch` par défaut (R-8).
  - MAIN-GUARD-REALPATH-1 (I-8, dépôt) : 32 fichiers de production gardent `resolve(process.argv[1])` (compte mesuré le 2026-10-03 à
    14:25 UTC sur `530bc309`) ; c'est le motif du constat F-4 (sortie 0 sans rien faire quand le script est lancé par une jonction),
    mesuré sur les trois scripts des lots avant leur correction, non mesuré fichier par fichier. Source : `ee7/corr2/CORR2.md` l.164,
    `ee7/rr2/G2-RAPPORT.rr2.md` l.37 (mutants N8 et N11 : Q-14 du lot EE-7). Déclencheur : prochain lot qui touche l'un d'eux ;
    état : ouvert ; N8 et N11 non équivalents, tueurs mesurés (campagne de fusion du 2026-10-03, `F:/tmp/rech/mutfusion/`, section 5,
    prix environ 8 lignes) ; le lot EE7-ADD7-1 touche le détecteur : à tuer à son tour de corrections. Partie EE-7 close le 2026-10-03 :
    N8 et N11 tués (`F:/tmp/methode/ee7add7/mut-2/RESULTS.json` `0bf6e1c4...`, G26 et G27 `strict` ; épingles vertes à la base) ; garde
    de l'enregistreur Coinbase : G02 et G03 tués (COINBASE-MUTANTS-CORR-1). Portée étendue (Q-CORR-4 du correcteur de COINBASE-ADD7-1) :
    gardes de `compare-coinbase-passes.mjs` l.141 et de `probe-coinbase-bounds.mjs` l.169, formes G02 et G03 survivantes, non
    équivalentes (`c306cb83...`, sonde `4f489257...`) ; déclencheur : la réponse à Q-CORR-4, au plus tard la G2 de la partie. Cette
    partie Coinbase **close le 2026-10-04** par COINBASE-PASS-EDGES-1 (fusion `44d8892d` ; Q-MA-7) : XC-G02 et XC-G03 (garde de la
    comparaison, l.165 au tronc) tués par le test l.193 de `test/compare-coinbase-passes.test.ts`, XP-G02 et XP-G03 (garde de la sonde,
    l.173) par le test l.248 de `test/probe-coinbase-bounds.test.ts`, chacun par une jonction sous `--preserve-symlinks-main` et un
    import à `argv[1]` absent (`cbedges-corr/mut-2/RESULTS.json` `321da4a1...`, stricts ; re-revue : rouges,
    `cbedges/rr/G2-RAPPORT.rr.md` l.73-76). L'item reste ouvert pour les autres fichiers de production (déclencheur ci-dessus).
  - TUYAU-EE7-IN-1 (branchement ; absorbe COINBASE-EE7-PIPE-1) : test d'intégration non-LLM enregistreur Coinbase, dossier mensuel,
    détecteur EE-7, contrôles du manifeste compris. Source : `ee7/corr2/CORR2.md` l.165, `cb/G1.md` l.376-380. Déclencheur : fusion
    de l'enregistreur, atteint (`fca34dc2`) ; état : clos le 2026-10-03 par le test l.630 de `test/detect-ee7-history.test.ts`
    (EE7-ADD7-1, fusion `e970c488` ; constat C-7 de sa G2) : `record()` de l'enregistreur du tronc écrit le mois scellé `2025-03/15m`, le
    détecteur le lit, puis le refuse `manifest_mismatch` une fois son manifeste passé à BTC-USD ; F2P : l.630 base `assert-fail`, gel
    `pass` (`F:/tmp/methode/ee7add7/red-proof-1/RED-PROOF.json` `b0d68230...`, sorti `ok` faux pour deux épingles, l.551 et l.569, pas
    pour ce test). Ni l'enregistreur ni le détecteur ne sont « built » : TUYAU-EE7-OUT-1 reste ouvert ; passe 1 seule (la seconde lecture
    et la comparaison : COINBASE-PASSES-PIPE-1).
  - TUYAU-EE7-OUT-1 (branchement) : consommateur de la liste `H-EE-7-<n>` hachée avant le descellement. Source : `ee7/G1.md` l.100.
    Déclencheur : préparation de P0-2 ; état : ouvert.
  - EE7-WINDOW-LEADIN-1 (recherche, avec RECHERCHES) : un épisode en cours au premier instant enregistré n'est vu par aucune course ;
    lire `calm_certified_from` de la course officielle avant le hachage de S et F. Source : `ee7/corr2/CORR2.md` l.162,
    `ee7/rr2/G2-RAPPORT.rr2.md` l.35-36 (constats R-3 et R-4). Déclencheur : première course réelle du détecteur ; état : ouvert ; critère et
    sort de l'amorce posés par Q-U3.
    Addendum 7 (réponse à Q-U3) : W3 et W4 faits au code par EE7-ADD7-1 (genres `lead-in` et `open-at-end`, fusion `e970c488`) ; W2
    (`calm_certified_from` au plus 2022-09-01T00:00Z avant tout hachage) non outillé par le détecteur (Q-7 de son G1, C-8 de sa G2) ; le
    cas `calm_certified_from` nul (Q-1 de son G1, défaut prudent) ne touche qu'une course que W2 refuse de hacher (P2 de sa G2).
  - EE7-C3-TRADES-1 (porteur RECHERCHES) : mesurer l'écart C3 par les transactions de la place primaire autour de chaque S et F.
    Source : `ee7/corr2/CORR2.md` l.163 ; transmis à RECHERCHES le 2026-10-03 (recherches#71, section 7). Déclencheur : première course
    réelle, avant le descellement ; état : ouvert.
  - GUARD-IMPORT-REGEX-1 (recherche) : la garde `packages/rpc-guard/test/durable.test.ts` l.274 lit le texte brut, chaînes et
    commentaires compris (faux rouge au G1 du détecteur) ; une lecture lexicale est à chercher. Source : `ee7/corr/CORR.md` l.160.
    Déclencheur : prochain lot qui touche la garde, ou prochain faux rouge ; état : ouvert.
  - PROBE-NARABI-LOAD-1 (recherche) : trois tests de `test/probe-narabi-state.test.ts` rouges une fois sous charge (premier GET jamais
    reçu), verts seuls ; lien possible avec LOOPBACK-SEQUENTIAL-PORTS-1, non mesuré. Source : `ee7/corr/CORR.md` l.135 et l.161.
    Déclencheur : prochain rouge de ces tests ; état : ouvert. Déclencheur atteint le 2026-10-03 : l'oracle G7 du tronc à `e970c488`
    (enregistrement `efbf12f0...`, 19:00:04Z à 19:12:28Z) sort 1 sur `probe_state_digest_cross_check` (l.93 : `unreachable` au lieu
    de `state_mismatch`) ; rejeu à `31e119ec` vert (`6052f3e7...`). Mesurer avant de lier (HANDOFF, Q-6) ; départ : Q-9 de
    `F:/tmp/rech/itemsadd7/JOURNAL.md`. **Clos le 2026-10-03 (21:58 UTC)** par le lot PROBE-NARABI-LOAD-1 (G1 LIVRE, G2 neuve APPROUVE,
    journal archivé `docs/G1-lot-probe-narabi-load.md`) : cause MESURÉE, le port 0 de cet hôte suit une séquence globale ; le `fetch`
    de Node 24.15.0 refuse 19 ports entre 1024 et 10080 avant tout appel, et la sonde rend alors `unreachable` ; correctif dans le
    test seul (port au-dessus de 10080, aide déjà éprouvée du dépôt), sonde servie inchangée ; banc : 13 rouges sur 60 avant, 0 sur 200
    après ; le rouge de `e970c488` reproduit à la lettre.
  - LOOPBACK-SEQUENTIAL-PORTS-1 (mis à jour) : la cause ci-dessus vaut pour tout test qui lie le port 0 et joint son serveur par
    `fetch` ; une dizaine de fichiers le font encore (liste du G1, complétée par la G2 : `apps/harness/test/server.test.ts`,
    `apps/harness/test/http.test.ts`, `test/byo-demo-probe.test.ts`, `test/byo-demo-builder.ts`). Construction : une aide partagée
    (port au-dessus de 10080) ; prix environ 15 lignes et un passage par fichier. Déclencheur : atteint ; prochain lot d outillage.
  - BADPORT-NODE-UPGRADE-1 (PAROXYSME) : la garantie tient pour la liste de ports refusés de Node 24.15.0 et undici 7.24.4 ; à chaque
    changement de version de Node relevé par l oracle, relire la liste embarquée. Déclencheur : premier changement de version de Node.
  - PROBE-BADPORT-REASON-1 (sonde servie) : **Clos le 2026-10-04 au tronc** par le lot du même nom (G1 LIVRE-AVEC-RESERVES, G2 neuve
    APPROUVE, fusion `728bd6b5` ; journal `docs/G1-lot-probe-badport.md`) : raison `bad_port` avant tout appel, liste recopiée de node
    v24.15.0 avec sa provenance et un test contre la source embarquée ; ADR-NARABI-OPS-1 et RUNBOOK-sentinel amendés. Reste un acte :
    le déploiement sur Bell, sous le go de l investisseur, précédé de la vérification de la liste pour le node de Bell (v24.21.0).
    **Déployé sur Bell le 2026-10-04 à 06:56:55 UTC** (go « vous avez tous mes GO ») : liste de Bell (node v24.21.0, undici 7.29.1)
    égale à la copie, 82/82, sha256 `544e409f…` ; fichier `15da93f2…` au sha `728bd6b5`, précédent gardé ; tir simulé sain.
  - PROBE-BADPORT-STATE-1 (Q-4 du G1) : une `PROBE_STATE_URL` sur un port refusé reste `state_unreachable` ; une raison nommée
    changerait l ensemble fermé `state_*` de l ADR-NARABI-OPS-1. Prix : environ 3 lignes et 1 cas. Déclencheur : le prochain changement
    de la sonde ; état : ouvert.
  - PROBE-MAIL-VOCAB-BADPORT-1 (Q-5 du G1) : la liste de raisons de `probe_alert_mail_has_no_forbidden_vocab` ne nomme pas `bad_port`
    (couvert par T2 sur le courriel réel) ; l y ajouter dans un lot qui accepte le refus de red-proof pour un test déjà vert. Prix : une
    ligne. Déclencheur : le prochain lot de la sonde ; état : ouvert.
  - NODE-NATIVES-READ-1 (PAROXYSME) : le test de la liste lit `process.binding("natives")`, déprécié (DEP0111) ; un node qui le
    retire fait échouer le test (« not readable »), jamais passer à tort. Construction : lire la liste dans l exécutable de node, ou
    balayer les ports sans connexion ; environ 20 lignes. Déclencheur : le premier échec « not readable » ; état : ouvert.
  - VERIFY-BADPORT-1 : `apps/bell/scripts/bell-verify.mjs` et `apps/dojo/scripts/dojo-verify.mjs` lisent un port refusé par `fetch`
    comme une panne de réseau. Construction : la même garde nommée. Déclencheur : le prochain lot qui touche leur transport ; état : ouvert.
  - PROBE-UNREACHABLE-WATCH-1 : tout rouge `unreachable` d un test de sonde après ce correctif rouvre la cause ; un rouge naturel
    antérieur du fichier frère `test/probe-narabi.test.ts` (enregistrement `21e79bd7…-cp-2-20260929…`, l.2626-2637) est consigné
    ici. Déclencheur : le prochain tel rouge ; état : ouvert.
  - CURSOR-SUITE-RATE-1 (mesure) : vitesse de la séquence de ports pendant une suite complète, environ 10 lignes et 10 minutes de
    verrou. Déclencheur : la construction de LOOPBACK-SEQUENTIAL-PORTS-1 ; état : ouvert.
  - MUTANTS-TEST-SUPPORT-1 (outil ; mesuré le 2026-10-03 au G1 de L2-P1-a1) : `scripts/mutants/run.mjs` et `scripts/red-proof.mjs`
    refusent tout tueur sous `test/` ; un module d appui de test déclaré (la place factice du chantier L2) ne peut donc pas prouver
    ses tueurs. Construction : admettre un module d appui déclaré sous `test/` (jamais un `*.test.ts`), amendement daté de la
    convention, cas neufs aux tests de l outil ; environ 30 lignes et 4 cas. Déclencheur : la fusion de MUTANTS-TOOL-2 ; puis
    campagne de L2-P1-a1 rejouée ; état : ouvert.
  - Lots d outil MUTANTS-TOOL-2 et LOOPBACK-PORTS-1, tours de corrections (décisions de l orchestrateur, 2026-10-04, 03:4x UTC) :
    - MUTANTS-TOOL-2 : correcteur `claude-opus-5-5` LIVRE-AVEC-RESERVES, re-revue `claude-sonnet-5-5` (palier de re-revue ciblée d un
      petit diff) APPROUVE-AVEC-CORRECTIONS ; O-1 plié par l orchestrateur (`timed_out?: boolean` dans `run.d.mts`). Q-C1 : non, D-3
      ne s étend pas à la base (une base non nulle donne « non conclu (base) », jamais « survit ») ; Q-C2, Q-C3, Q-C6, Q-C8 et Q-C9 :
      lectures confirmées ; Q-C4 : `timed_out` gardé et déclaré ; Q-C5 : garde de l.271 gardée, C17 survivant équivalent déclaré
      (sonde exit-probe) ; Q-C7 : la borne 547 gouverne (466). MUTANTS-MEMORY-WAIT-1 (absent d ETAT, HANDOFF Q-MA-9) : clos par ce lot.
    - LOOPBACK-PORTS-1 : correcteur LIVRE-AVEC-RESERVES, re-revue `claude-sonnet-5-5` APPROUVE (elle sert de revue ciblée des lignes
      exécutables de l aide, Q-CORR-6). Q-CORR-1 : garde en fichier neuf confirmée ; Q-CORR-2 : mesure des mutants cas par cas
      ratifiée pour ce lot (l outil du tronc refuse `test/`), table de 13 lignes rejouée à la fusion de MUTANTS-TEST-SUPPORT-1 ;
      Q-CORR-4 : contrôle refait au HEAD de la fusion ; Q-CORR-5 : Q-11 du G1 close.
  - LOOPBACK-PORT0-HELPER-ONLY-1 (PAROXYSME ; Q-CORR-3) : la garde de port 0 est lexicale ; un port 0 tenu dans une variable, ou un
    `--port 0` passé à un processus, lui échappe. Construction : garde stricte, toute liaison d un fichier de test passe par l aide ;
    environ 6 lignes de garde et 1 de test, 1 site à inliner (mesuré). Déclencheur : HARNESS-LOOPBACK-PORTS-1 (RECHERCHES) ; état : clos
    au G7 du lot (l.181) ; limites déclarées (l.137-140) reprises par LOOPBACK-GUARD-RUNTIME-1 ci-dessous.
  - LOOPBACK-CLOSEDPORT-RACE-1 (PAROXYSME ; Q-CORR-7) : le cas D-2 et le test 6 du G1 dépendent d un port fermé qu un autre processus
    peut prendre. Construction pour D-2 : une fabrique qui lie port + 1, environ 2 lignes, puis rejeu de M18, M21 et de l oracle ;
    pour le test 6, mesure de fréquence au banc d abord. Déclencheur : HARNESS-LOOPBACK-PORTS-1 ; état : clos
    au G7 du lot (D-2 et test 6, `docs/G7-lot-harness-loopback-ports-1.md` l.181).
  - EXPORT-HARNESS-413-LOAD-1 (2026-10-04 14:3x UTC ; 1re passe de v0.8.0) : `oversized_body_413_and_normal_tools_call_unaffected`
    rouge une fois dans la CI exportée du test 42, sous charge (65 ms), assertion interne non nommée ; 15/15 vert au repos, test 42
    vert dans 103 relevés d oracle. Construction : le test 42 porte le texte de l assertion interne, reproduction sous charge, test
    déterministe sans perdre (a2) ni ses tueurs. Porteur : RECHERCHES (recherches#129), PR sur le tronc ; état : clos
    le 2026-10-04 16:4x UTC, #127 fusionnée au tronc (`60c481e6`). Cause : le RST après le 403 ; sous win32, la réponse reçue non lue
    est jetée. (a2) jugé sur `{403, complete: false}` côté serveur ; 30/30 vert sous charge Windows à `50031a46` ; oracle G7 vert
    (2218 tests, 0 échec).
  - LOOPBACK-GUARD-RUNTIME-1 (PAROXYSME ; limites déclarées du G7 de HARNESS-LOOPBACK-PORTS-1) : la garde est lexicale ; lui échappent
    un nom calculé, un alias par déstructuration, `PORT=0` en environnement, dgram sans import, une expression du port. Construction :
    une garde d exécution chargée par `--import` pour chaque fichier de test, qui intercepte `listen` et `bind` de net et dgram et
    refuse un port hors du tirage de l aide ; prix à mesurer au G0. Porteur : RECHERCHES, après CM-3c ; état : ouvert.
  - EXPORT-TEST42-SUMMARY-1 : le test 42 rougit parfois en « implausibly small suite » (CI exportée sortie 0, ligne de résumé non
    captée). Hypothèse (G2 de #127) : `--test-force-exit` appelle `process.exit` avant que stdout ait fini de s écrire dans le tube,
    sous Linux ; `scripts/red-proof.mjs` contourne déjà ce cas. Construction : lire le résumé dans un fichier de reporter
    (`--test-reporter-destination`) au lieu de stdout. Porteur : RECHERCHES ; état : ouvert.
  - CI-G3-DURATION-1 : `g3-verification` prend 7 min 06 s sur le runner (#125) ; #121, #126 et #112 coupées à 10 min, tests en
    cours. Borne portée à 20 (`04c97744`, règle temps × 3, plafond 20). Construction : mesurer les fichiers sur le runner, sortir le
    test 42 (151 s au run de #126) dans son propre job s il domine. Porteur : RECHERCHES ; état : clos le 2026-10-04, #130 au tronc
    (`0effb5b2`) : `g3-verification` lance `test:main` (3 min 41 s), `g3-export` le seul test 42 (1 min 28 s, borne 10) ; oracle vert.
  - G3-EXPORT-REQUIRED-1 (de #130) : `g3-export` n est pas un contrôle requis sur `main`. À ajouter à la protection de branche quand
    ce workflow atteindra `main` (acte de l orchestrateur, fenêtre publique de l investisseur). Porteur : MONARK ; état : ouvert.
  - SENTINEL-SIGTERM-LINUX-1 : `sentinel_run_releases_chainstack_lock_on_sigterm` est sauté sous win32, donc jamais jugé par l oracle
    Windows ; rouge deux fois sur la CI Linux de `recherches/cm-2c` (`d939ec4c`, run `37184209168`), vert sur #126. Demande : 20
    passes au repos et 20 sous charge sous Linux à `60c481e6` (recherches#135). Porteur : RECHERCHES ; état : clos le 2026-10-04
    16:5x UTC : vert à `c68451fc` (20/20 au repos, 60/60 sous charge) ; rouge de `d939ec4c` reproduit (9/63 sous charge), base sans
    `9d6181e0` (SENTINEL-SIGTERM-LOAD-1 : l ancien test envoyait SIGTERM avant le gestionnaire). Rapport RECHERCHES
    `pieces/2026-10-04-sentinel-sigterm-linux/RAPPORT.md`.
  - SENTINEL-SIGTERM-STARTUP-WINDOW-1 (nommé au G0 et au G7 de SENTINEL-SIGTERM-LOAD-1, absent d ETAT jusqu ici) : `run.ts` prend le
    verrou (l.295) avant d installer son gestionnaire de SIGTERM (l.342) ; un SIGTERM dans cette fenêtre tue le processus et laisse le
    verrou pris. Construction : installer le gestionnaire avant la prise du verrou, test qui envoie SIGTERM dans la fenêtre. Porteur :
    RECHERCHES (zone ouverte : `apps/sentinel/src/run.ts` et son test) ; déploiement de la sentinelle par MONARK ; état : code au
    tronc (#137, `124c03c2` ; CI Linux : les 4 tests SIGTERM verts ; oracle Windows vert) ; déploiement groupé avec
    RPC-GUARD-LOCK-WRITE-LEAK-1 (décision de l investisseur, 2026-10-04 21:4x UTC), fait le 2026-10-04 à 23:34:40 UTC (arbre
    `c9aebb44`, JOURNAL-PROVENANCE) ; état : clos.
  - ADR-CM-AMEND-3-1 : l amendement ADR-CM « 2026-10-04 (3) » (1.1.0) est cité par d autres ADR mais absent du tronc et de la base
    (Q-4 du G0 de CM-4a-i). Porteur : RECHERCHES, PR de documentation de l étape 7 du plan CM-3c/CM-4 ; état : ouvert.
  - SERVED-PENDING-1 (plan r3 §8.5, étendu au chargeur du site ; absent d ETAT jusqu ici) : un instantané en attente
    `apps/site/data/harness-pending.json` (schéma propre `harness-pending-v1`, champs en processus seuls), écrit hors ligne au temps (i) ;
    les tests de l état servi le comparent au harnais en processus quand il existe ; les pages gardent le servi, seules les traces BYO
    et H5 le lisent ; promotion par la synchro au temps (ii) sous contrôle de MONARK. Décisions Q-SP1-1 à Q-SP1-5 du 2026-10-04 17:0x UTC
    (messagerie). Porteur : RECHERCHES, PR sur la base avant le bloc C ; état : en cours (G0 `bdc946b2`).
  - UKEMI-PENDING-1 (Q-SP1-4) : les deux tests de site-ukemi (`:1198`, `:1438`) lisent `ukemi-served.json` et rougiraient au bloc C
    sur `schema_version` du corps de la CA, ce qu un instantané en attente du harnais ne couvre pas. Construction : le même mécanisme
    pour l état servi d ukemi (synchro et vérification). Porteur : RECHERCHES, sur la base avant le bloc C ; état : en cours (PR #133,
    `CA_SCHEMA_VERSION` ; l instantané en attente d ukemi est reporté au G0 du bloc C sous UKEMI-PENDING-SNAPSHOT-1, G0 du lot).
  - MUTANTS-LIVE-WAITER-AHEAD-1 (2026-10-04 18:4x UTC) : G28 (`mutants_a_live_waiter_ahead…`) rouge sous la charge de l oracle
    (lock_wait_ms < 1000) : depuis #125 l attendant de 6 s fixes part au chargement et peut mourir avant l entrée de l outil dans
    l attente. Construction : l attendant vit jusqu à cette entrée ; même examen pour G27 (3 197 ms pour 3 600 sous Windows). Porteur :
    RECHERCHES (recherches#141), PR sur le tronc avant #130 ; état : clos le 2026-10-04, #136 au tronc (`4dc1f504`), oracle vert.
  - L2-LINKS-FILE-CRASH-1 (2026-10-04 18:3x UTC) : `test/l2-links.test.ts` planté au chargement sous l oracle (363 ms, aucun test
    rapporté, aucune trace), une fois. Construction : rendre la cause lisible (`test/helpers/keep-cause.ts`), `trap()` et
    `mkdtempSync` dans `before()` ; rejeu Windows par MONARK après la PR. Porteur : RECHERCHES (recherches#140) ; état : clos le
    2026-10-04, #134 au tronc (`f57ef792`) : rejeu Windows 17/17 trois fois, oracles verts sans ligne `# keep-cause`.
  - TEST-FORCE-EXIT-REPORT-LOSS-1 (2026-10-04 20:2x UTC ; proposé par RECHERCHES) : sous Linux, avec `--test-force-exit`, des
    rapports de fin de fichier se perdent alors que le fichier sort 0 (suites vertes à 2 116 et 2 170 tests rapportés pour 2 211) ;
    une CI verte ne prouve alors rien des tests non rapportés. Construction au G0 : compte rapporté contre un plancher ou contre un
    fichier tap. Porteur : RECHERCHES, zone ouverte (scripts de test, `ci.yml`, un test de garde ; recherches#145) ; état : clos le
    2026-10-05 par #142 (tronc `d305ae15` ; oracle Windows vert, 2 250 tests, 0 échec ; `test:main` et `test:export` verts sous `cmd.exe`).
  - CM-5-PLAN-1 (audit P3, E-11/S-14 : la surveillance par clé kata de CM-5, qu aucun bloc A à E ne porte) : G0 de CM-5 après T0,
    ou raison écrite de ne pas remédier. Porteur : RECHERCHES ; déclencheur : T0 ; état : ouvert.
  - L2-DAY-SCAN-WINDOW-1 (Q-C1-6 du G7 de L2 P1-c1) : une trame dont l heure de place suit sa réception de plus d une heure n est pas
    lue au scellé de son jour ; elle est rangée au jour de son segment, marquée `early` et comptée. Mesure en M-6. Porteur :
    RECHERCHES ; état : ouvert.
  - BLOC-C-ACTES-MONARK-1 (G0 du bloc C, 2026-10-05) : (a) appliquer la pièce des textes d ADR (Q-M7 : ADR-M001 D4 et C5, ADR-M005
    K-4 (c), ADR-M007 §7, ADR-M010 §12, `CONTRIBUTING.md:56-57`) et trancher ses deux ajouts optionnels, avant la fusion de C2 ;
    (b) écrire les entrées de `frozen_contract_fields_stay_dynamic` que RECHERCHES propose (Q-M14) ; (c) seconde ligne Z-3 en C' (S-8,
    B-13) ; (d) fusionner la PR de l amendement 9 de l ADR-CM, contrôlée le 2026-10-05, avant le code de C1. Porteur : MONARK ; état :
    ouvert.
  - TAIL-TS-COUNTS-1 (Q-1 de CM-4a-ii, voie (a)) : l addendum 8 d ADR 0006 (P0 `ec202d00`) garde l exception de zone : MONARK écrit
    `tail.ts` et la garde de vague 2. Livrable de MONARK : l entrée par comptes de `tail.ts` (`{num, den}` non réduits, chaînes
    décimales, refus de l addendum §1), sur la signature et les vecteurs que RECHERCHES fournit ; tests et tueurs W2-E chez
    RECHERCHES. Déclencheur : la pièce de RECHERCHES ; avant le lot b de CM-4a-ii. Porteur : MONARK ; état : livré le 2026-10-04,
    PR #135 fusionnée sur la base (`abe14e6b`, oracle vert, 2 257 tests) après la G2 APPROUVE de RECHERCHES ; 10/10 vecteurs, 6 000
    accords avec la doublure ; tests et tueurs W2-E au lot b de CM-4a-ii (RECHERCHES).
  - VERIFIERS-LIST-F5A-1 (Q-2 de CM-4a-ii) : la liste publiée des vérificateurs listés (identité lue avant « @ », minuscules ASCII)
    est due par MONARK avant F-5a. Porteur : MONARK ; état : ouvert.
    Amendement (2026-10-06 02:39 UTC, G2 de SPEC-1-1-0-RELEASE partie a, N-3 ; décision de MONARK) : déclencheur changé. L item devient
    bloquant à la première table publiée dont une ligne porte `recompute` non nul (toute ligne kata qui le porte, pas la seule vague 2), et
    non plus seulement « avant F-5a ». Fil : la porte de `scripts/spec-publish.mjs` (`tableRowProblems`, code `recompute_held`) refuse
    une telle table, même réépinglée à la main, et l écrivain `scripts/spec-policy-tables.mjs` appelle la même fonction ; tests
    `no_table_with_a_recompute_row_is_published_before_the_verifier_list` et `spec_publish_refuses_a_hand_edited_table_even_pinned_again`.
    La version `contract-1.1.0` n en publie aucune.
    Précision (2026-10-06 03:16 UTC, G2 delta de SPEC-1-1-0-RELEASE partie b, M-1) : « table publiée » se lit **fichier de table** publié
    (`policy/*.json`, sorte `policy-table`). Le fichier de vecteurs `contract-1.1.0/vectors-1.1.0.json` publie deux tables synthétiques
    (`synthetic_kata.tables`) dont des lignes portent `recompute`, `aux_sha256` et `series_sha256` : ce sont des vecteurs de recalcul,
    pas des fichiers de table, et la porte ne les lit pas comme tels (seule la valeur racine d un fichier compte). Aucun fichier de table
    de cette version ne porte `recompute`. Depuis la même G2, une table déclarée `json` ou `text` est refusée (`policy_table_kind`) : la
    garde ne dépend plus du `kind` choisi.
    Précision (2026-10-06 03:29 UTC, G2 delta b2 de SPEC-1-1-0-RELEASE, N-1) : la phrase précédente ne valait que pour une table à la racine
    d un fichier, `row_format` exact, chemin en minuscules. Désormais, `spec-publish` reconnaît une table à sa forme (un objet avec un
    tableau `rows` et une entrée `class` qui nomme un `task_class`), à toute profondeur et quel que soit son `row_format`. Tout fichier qui
    en contient une, et tout chemin qui a un segment `policy/` (toute casse), doit être une entrée `policy-table` au chemin exact
    `[contract-<x.y.z>/]policy/<classe>.json`. Seul le fichier de vecteurs `contract-<v>/vectors-<v>.json` peut en contenir sans l être :
    chacune de ses tables passe `tableRowProblems`, et seules les tables de `synthetic_kata`, fixtures de recalcul, sont dispensées de
    `recompute_held` et de la règle des empreintes de suite ; `n` et `p_served` ≤ 30 restent refusés partout.
  - SHORT-DIGEST-INVERSION-1 (constat F-1 de la vérification de la spécification 1.1.0, §10 « Short 0/1 sequences ») : gardé depuis le
    2026-10-06 par la porte de `scripts/spec-publish.mjs` (`tableRowProblems`, code `short_digest`), que l écrivain appelle aussi : elle
    refuse toute ligne de n ≤ 30 ou de `p_served` ≤ 30, et toute ligne dont `aux_sha256` ou `series_sha256` est non nul (le nombre de
    points de ces empreintes n est pas écrit dans la ligne) ; tests `no_table_publishes_the_digest_of_a_sequence_of_30_points_or_fewer`
    et `spec_publish_refuses_a_hand_edited_table_even_pinned_again`. Reste ouvert pour la révision qui publiera des lignes kata (elle dit
    comment elle tient la règle). Porteur : RECHERCHES ; état : gardé (G2 de SPEC-1-1-0-RELEASE b, N-1 et M-1, 2026-10-06).
    Ligne datée 2026-10-07 (MONARK, #215, fusion `c318aa54`, `docs/G7-lot-short-digest-floor.md`) : le plancher exact remplace le refus
    en bloc.
    - Une ligne `sign-set` ne publie ses digests 0/1 que si au moins 2^128 suites sont compatibles avec ce qu elle dit. Le compte est
      exact, en entiers, dans `apps/harness/src/policy-digest-floor.ts`.
    - Une bande publie `aux_sha256` égal à ses scores. Toute autre empreinte d une suite non dite est refusée.
    - La porte (`tableRowProblems`) et la garde (`guardKataRow`) appliquent la même règle.
    - Vague 1, mesurée sur `811fcd57…` : 28 tables publiables ; les quatre dir-4h sont retenues (29 lignes sous le plancher).
    
    État : construit, « upcoming » jusqu au chargeur d E-2a (E2A-DIGEST-FLOOR-TEST-1). Items formés au G7, ci-dessous.
  - DIR-4H-DIGEST-COMMIT-1 (PAROXYSME ; G0 de SHORT-DIGEST-INVERSION-1 §8) : les quatre tables dir-4h ne peuvent être servies sans
    divulguer des suites sous 2^128. Recherche : un engagement salé par les données, ou à clé. Prix : contrat 1.2.0, régénération du
    registre, outil du vérificateur, ligne d A-2. Porteur : RECHERCHES (spécification), puis MONARK (code) ; déclencheur : avant tout
    service d une table dir-4h, ou avant le pré-enregistrement de cellules de direction d une autre vague ; état : ouvert.
  - E2A-DIGEST-FLOOR-TEST-1 (tuyau ; G0 §8) : le test de composition registre → projection → garde → porte, qui affirme 28 publiables et
    les quatre dir-4h retenues, et la sélection des classes par le chargeur. La garde lève sur une dir-4h : le chargeur la retient avant
    l appel. Porteur : MONARK, au titre d E-2a ; déclencheur : le lot qui verse `wave1.json` dans `apps/harness/data/kata/registry/` ;
    état : ouvert.
  - VERIFIER-REPORT-DIGESTS-1 (G0 §8) : le rapport de recalcul publié ne porte aucun digest d une ligne retenue, ni de digest 0/1 sous le
    plancher ; sa liste `inputs` publie les quatre digests de séries. Porteur : MONARK, partie 2 de VERIFIERS-LIST-F5A-1 ; état :
    ouvert.
  - FLAT-CAP-NEXT-WAVE-1 (G0 §8) : la borne de 34 plats est une mesure de la vague 1, pas une loi. Une ligne `sign-set` d une autre vague
    est refusée, fermée, tant que la borne de sa vague n est pas mesurée et épinglée. Porteur : RECHERCHES ; déclencheur : une vague
    autre que la 1 avec des lignes `sign-set` ; état : ouvert.
  - DIGEST-FLOOR-ATTACKER-COST-1 (recherche ; G0 §8) : lire sur place une source primaire de débit SHA-256 sur matériel parallèle, et la
    citer [lu]. Aucun chiffre de seconde main d ici là. Porteur : MONARK ; déclencheur : avant tout texte public qui chiffre le coût
    d une inversion ; état : ouvert.
  - DIGEST-FLOOR-FLAT-EXACT-1 (PAROXYSME ; G0 §10.6) : les bornes du double comptage et de l union sont des minorants. Elles peuvent
    retenir une ligne dont le compte exact atteint 2^128 (mesuré : 2^127,88 contre 2^128,35). Recherche : une preuve de la monotonie
    mesurée jusqu à n = 14, ou un compte exact des suites compatibles. Prix : une preuve combinatoire, ou un algorithme de comptage
    et son oracle d énumération. Porteur : MONARK, avec RECHERCHES pour la preuve ; déclencheur : une ligne `sign-set` d une vague future
    entre la borne et le compte f = 0, ou un texte qui écrirait « exact » sans réserve ; état : ouvert. Vague 1 : sans effet (marge
    d au moins 210 bits sur les dir-1h).
  - BAND-AUX-DIGEST-W2-1 (Q-11 de RECHERCHES, `82e61e8`) : la règle des bandes (`aux_sha256` = `scores_sha256`) n est mesurée que sur la
    vague 1. Une bande de vague 2 dont l `aux_sha256` diffère est refusée par la porte et par la garde. FORMAT-W2 doit dire ce que digère
    l `aux_sha256` d une bande de vague 2. Porteur : RECHERCHES ; déclencheur : FORMAT-W2 ; état : ouvert.
  - SHORT-DIGEST-SPEC-TEXT-1 (Q-8 et Q-12 de RECHERCHES) : la révision datée du texte de la spécification. Elle écrit :
    - la règle du plancher (F = 128, la borne de 34 plats, le sort des fixtures) ;
    - la borne des scores sur chaque f, avec N à trois arguments, `N(n, misses − f, runs_aux)` ;
    - la borne de l union à qhat 0.
    
    Elle sort avec la section 8 de KATA-SPEC (TRIAL-HEAD-WRITTEN-1) et l ordre des motifs (KATA-SPEC-REASON-ORDER-1). Porteur :
    RECHERCHES (texte), MONARK (brouillon) ; déclencheur : avant la première publication datée de lignes kata (E-2a), avec sa ligne
    P0 ; état : ouvert.
  - SHORT-DIGEST-RELEASE-NOTE-1 (Q-7 de RECHERCHES) : la phrase de la note de version qui dit que les quatre dir-4h sont retenues, et
    pourquoi, sans nom d item. Porteur : MONARK ; déclencheur : la note de version de la première release datée qui publie des tables
    kata (E-2a) ; état : ouvert.
  - TEMPLATE-MARKERS-SOURCE-1 (E-2 de la contre-G2 de T0-TOOLING-1, 2026-10-06) : la règle `ph` de `scripts/public-text-deny.mjs`
    refuse `${NOM}` quand NOM est dans `TEMPLATE_MARKERS` (`T0`, `OPENAPI_SHA256`, `SPEC_URL`), liste écrite à la main : le seul modèle
    qui les porte (la NOTICE) vit dans recherches. Effet aujourd hui : aucun. Option A retenue par MONARK : engager le modèle de notes
    dans governance (`docs/public-notes/TEMPLATE.md`) et dériver `TEMPLATE_MARKERS` de ce fichier, avec son test (~60 lignes).
    Déclencheur : après T0 (2026-10-06), ou plus tôt si un modèle ajoute un marqueur. Porteur : RECHERCHES ; état : ouvert.
    Ligne datée 2026-10-06 (RECHERCHES, lot T0-FOLLOWUP-1) : clos. Le modèle est engagé (`docs/public-notes/TEMPLATE.md`, marqueurs
    `{T0}`, `{SPEC_URL}`, `{OPENAPI_SHA256}`) ; `TEMPLATE_MARKERS` en est dérivé (`templateMarkers`), test
    `template_markers_follow_the_committed_template`. Le modèle n est pas un texte public (`kindForPath` ne lui donne aucun genre ; `docs/`
    n est jamais exporté).
    Ligne datée 2026-10-06 (RECHERCHES, lot T0-FOLLOWUP-1, repli des G2 F-5, F-6, T-1 et T-2) : les marqueurs sont lus avec la forme de
    la règle `ph` (espaces internes, trait d union), jamais un `${NOM}` du modèle (variable de shell) ; un modèle sans marqueur est refusé
    par son nom, au chargement ; `${SPEC_URL}` est refusé comme marqueur. Un test et un tueur déclaré par constat.
  - SPEC-PUBLISH-PREVIOUS-BLOBS-1 (acte 8 de T0, 2026-10-06 : sous Windows avec `core.autocrlf=true`, le clone `previous` portait des CRLF
    dans son arbre de travail, et `input_digest` refusait, fermé) : clos par le lot T0-FOLLOWUP-1. Chaque entrée `root: "previous"`, le
    contrôle « carried » et le contrôle `rewritten` lisent l objet git de `previous_commit` (`git cat-file blob`, sans shell ni filtre) ;
    un chemin absent du commit est nommé `previous_blob_missing`. Test `previous_entries_are_read_from_the_pinned_commit_not_the_working_tree`.
    Ligne datée 2026-10-06 (RECHERCHES, lot T0-FOLLOWUP-1, repli de la G2) : chaque appel git de `spec-publish` tourne avec
    `GIT_NO_REPLACE_OBJECTS=1` (un objet de remplacement ne masque plus une réécriture) ; un objet publié illisible est refusé
    `previous_blob_missing`, jamais comparé à des octets vides ; le refus porte la première ligne du stderr de git. Un test et un tueur
    par constat : `a_published_contract_file_is_compared_with_its_committed_object`, `a_replace_object_does_not_hide_a_rewrite`,
    `an_unreadable_published_object_is_refused_never_read_as_empty`, `a_refused_previous_entry_carries_the_reason_git_gives`.
    Repli de la G2 T-3 : chaque objet de `previous_commit` est lu une seule fois par plan (test
    `each_object_of_the_previous_commit_is_read_once`, lectures comptées dans les événements trace2 de git).
    Ligne datée 2026-10-06 (RECHERCHES, lot T0-FOLLOWUP-1, repli de la G2 T-8) : lancé depuis un hook `pre-commit` d un worktree lié,
    `spec-publish` héritait de `GIT_DIR` et d un `GIT_INDEX_FILE` absolu, et l acte 8 refusait à tort un arbre `previous` propre (fermé :
    `previous_blob_missing`, `previous_commit` ou `previous_dirty`). Chaque appel git perd maintenant les variables de position du dépôt
    (`git rev-parse --local-env-vars`, sans égard à la casse) et garde `GIT_CONFIG_*`. Test
    `a_caller_s_git_location_never_stands_in_for_the_previous_tree`.
  - KATA-CLAUSE-COMMITTED-STATE-1 (G7 de D-2 §6, G7 de D-3 §7) : la clause kata de la description servie dit « which hold no committed
    calibration row » (`gate.ts:233`) ; le fil-piège `kataTablesHoldNoRow` (`kata-path.ts:125-128`, `gate.ts:1042`) fait échouer le
    chargement à la première ligne kata. Construction : la clause de l'état engagé, choisie par la présence au registre, comme
    `describeGate(registryHasLiq)` (`gate.ts:242-245`), avec ses octets fixés par une ligne datée Z-3. Porteur : RECHERCHES (texte et
    code, lot E-2a) ; MONARK (ligne Z-3). Déclencheur : le premier chargement d'une ligne kata engagée (G0 court de E-2a) ; état : ouvert.
  - DECIDED-AT-1 (plan r3 §9.4, « avant la vague 2 ») : pas de champ d'instant de décision. `request_sha256` et la borne de 300 s
    suffisent ; un champ `decided_at` sortirait du format 1.1.0 (version 1.2.0). Porteur : RECHERCHES ; déclencheur : avant le G0 court
    de E-1a ; état : **clos par raison écrite** (Q-E3, accord de MONARK `ff2d4cd`). Il se rouvre avec LATE-CALL-WINDOW-1 si la mesure
    de latence le demande.
  - FORMAT-W2 (G0 du bloc E, P-2 ; Q-E2) : le format de `wave2.json` (`recherches:kata/registry/`), à figer avant E-1 et avant P0-2,
    dont le générateur est épinglé à P0-2. Porteur : RECHERCHES (écrit), MONARK (contrôle) ; déclencheur : maintenant (tête du chemin de
    la vague 2) ; état : ouvert.
  - RPC-GUARD-LOCK-WRITE-LEAK-1 (H-1 de RECHERCHES, G2 de #137) : si l écriture ou le fsync du verrou échoue après un `openSync "wx"`
    réussi, le fichier reste hors de `acquired` (`guarded.ts:43-46`) et la garde répond `lock_held` jusqu à l acte du RUNBOOK.
    Construction : retirer le fichier sur échec d écriture, test et tueur d abord. Porteur : RECHERCHES (zone `packages/rpc-guard/`
    ouverte, recherches#150), après #137 et le lot b de CM-4a-ii ; état : clos au tronc par #140 (`c9aebb44`, CI verte, oracle
    Windows vert : 2 244 tests, 0 échec), déployé avec #137 le 2026-10-04 à 23:34:40 UTC (JOURNAL-PROVENANCE).
  - SENTINEL-GUARD-ARMING-1 : c est le 2ᵉ redéploiement d ADR-NARABI-OPS-1 (A.7 ; A.8 item 10 : déclencheur le G7 du pli §11-1,
    procédure RUNBOOK-sentinel §6-bis, propriétaire l orchestrateur), jamais exécuté. Relevé du 2026-10-04 à 23:3x UTC : la garde (-1d)
    tourne sur l hôte du site sans clés de cycle (fichier d environnement, comptes de clés seuls : URL 1, cycle 0, origine 0, plancher 0 ;
    pas de dossier `ledger/`) ; trois dry-runs rendent `chainstack: false`, `chainstack_guard: "unconfigured"`. La timeline publie 7
    points depuis la ligne du 2026-09-23 (`sentinel_sha` `e73866a8…`, arbre `af9b889`), 8 ou 9 avant : la jambe payante est noire
    depuis, et la phrase d A.7 « le VPS exécute `c4981d0` » (résiduel 118) est périmée. Construction : relire P-1 (pli §11-1 : fusion,
    G2-delta, re-checkpoint-2, G7) et P-2 (clôture du temps 1 et de la course U-4b-1b), puis §6-bis (3) à (7) avec P-3 lu sur place
    par l investisseur à la console Chainstack, ou une décision de l investisseur de laisser la jambe noire. Porteur : MONARK ; état :
    ouvert.
  - TEST-FORCE-EXIT-NEED-1 (question de RECHERCHES, 2026-10-04) : `--test-force-exit` est-il encore nécessaire ? Construction : mesurer,
    fichier par fichier, ce qui ne sortirait pas sans lui, puis le retirer s il n y a plus rien. Porteur : MONARK depuis le 2026-10-06 (relève,
    Q-2 de RECHERCHES, `e9de455`), avec FORCE-EXIT-WASM-TIERUP-1 (même cause d arrêt sous win32) ; état : ouvert.
  - FORCE-EXIT-WASM-TIERUP-1 (lot COINBASE-LOOPBACK-FLAKE-1, 2026-10-06) : sous win32, Node 24.15.0 s arrête sur `UV_HANDLE_CLOSING`
    (`srcwinasync.c:76`) quand `--test-force-exit` tombe pendant une tâche de fond de V8 (ici la montée de niveau du parseur WebAssembly
    de `fetch`) : la cause de l aléa relevé aux G2 de U4b et de T1a-iii-a1. Amont : nodejs/node#56645, corrigé par nodejs/node#61999 dans
    Node 24.20.0 LTS (`docs/methode/FAITS-node-win-exit-abort-2026-10-06.md`). Construction : Node 24.21.0 sur l hôte de travail (accord du
    fondateur, 2026-10-06), puis la sonde rejouée (attendu : 0 arrêt sur 8). Porteur : MONARK ; état : clos le 2026-10-06 : Node 24.21.0
    installé sur l hôte de travail (installeur vérifié : SHA-256 officiel et signature OpenJS) ; sonde : 0 arrêt sur 8 dans ses trois modes,
    contre 8 sur 8 en 24.15.0 ; ancien test à `fetch` (`7336d0f7`) : 0 sur 10, contre 20 sur 20 ; oracle témoin du tronc vert (`5b8255db…`).
  - COINBASE-LOOPBACK-FLAKE-1 (aléa de `g3-verification` sur #199) : cause nommée, une socket keep-alive du pool de `fetch` restée sur le
    port d un serveur fermé (`ECONNRESET`) ; état : clos le 2026-10-06 par #204 (tronc `1bb5cdb3`) : l assistant de boucle locale ne tire
    plus le port d un serveur qui n écoute plus (`docs/G7-lot-coinbase-loopback-flake-1.md`).
  - SITE-SEND-PRUNE-1 (ménage de l hôte du site du 2026-10-06 : 30 `.bak` et 4 `.prev-*` accumulés) : chaque envoi du site ajoute un `.bak`
    et renomme l ancien `.prev` avec sa date (RUNBOOK-vitrine, étapes 2 et 5) ; les déploiements du harnais font de même. Construction :
    l outil d envoi garde un nombre borné de points de retour (le `.prev` actif et les derniers `.bak`) et nomme le reste ; la suppression
    reste un acte avec accord du fondateur, ou un accord permanent à demander avec le lot. Porteur : MONARK ; état : ouvert.
  - MUTANTS-REPLAY-PROMOTE-1 (proposé au G7 de MUTANTS-RUN-EXIT-CODE-1, #144) : une ligne dont le rejeu est « tue » prend le statut
    du rejeu. Porteur : RECHERCHES ; déclencheur : le prochain lot qui touche `scripts/mutants/` ; état : ouvert.
  - DEP-RELEASE-AGE-RULE-1 (résidu du G7 de DEP-SOURCE-MAP-JS-1 ; déclencheur atteint par DEP-SHARP-1, #205, le 2026-10-06) : option (a)
    décidée par la cellule le 2026-10-06 (proposition de MONARK, vote de RECHERCHES `e9de455`) : une règle écrite de 7 jours avant d adopter
    une version neuve d une dépendance, avec une dérogation nommée pour un correctif de sécurité lu au G2. Porteur : MONARK, un lot de
    documentation ; état : clos le 2026-10-06 par #208 (tronc `05478bd6`) : la règle est une ligne datée de
    `docs/methode/REGLES-MISSION.md`, la case 11 de `docs/methode/CHECKLIST-G7.md` la contrôle au G7 (`docs/G7-lot-dep-release-age-rule-1.md`).
  - DEP-RELEASE-AGE-NPMRC-1 (item (a) du G0 de DEP-RELEASE-AGE-RULE-1) : `min-release-age=7` dans un `.npmrc` à la racine, garde de
    npm à l écriture du verrou (`npm install`, `npm update`), la dérogation par `--min-release-age-exclude`. npm 11.19.0 de l hôte de
    travail connaît la clé (mesuré au G0) ; la version de npm du runner de la CI et des hôtes, et la première version qui la connaît,
    sont à mesurer d abord (une clé inconnue est ignorée sans erreur, remarque de la G2 de RECHERCHES). Porteur : la cellule ;
    déclencheur : la prochaine montée de dépendance ; état : ouvert.
  - DEP-RELEASE-AGE-CI-1 (item (b)) : contrôle en ligne dans `g6-compliance` : les `version` du verrou changées entre la base et la tête,
    `npm view <paquet>@<version> time --json` pour chacune, refus sous 168 h sauf dérogation déclarée sous une forme fermée. Le seuil
    devient un seuil de CI (ligne datée d ADR-M003 D9, R-23). Porteur : la cellule ; déclencheur : après DEP-RELEASE-AGE-SOURCE-1 ;
    état : ouvert.
  - DEP-RELEASE-AGE-SOURCE-1 (item (c)) : une justification sourcée des 7 jours (lecture sur place d une source primaire, par exemple une
    mesure publiée du délai entre la publication d une version malveillante et son retrait du registre). Aujourd hui, les 7 jours sont
    une décision de la cellule, sans efficacité revendiquée. Porteur : la cellule ; déclencheur : avant DEP-RELEASE-AGE-CI-1 ; état :
    ouvert.
  - ADR-M003-SUFFIX-DUP-1 (erratum du journal du 2026-10-06 07:4x UTC) : le doublon « D9 octies » d ADR-M003 (2026-09-20 et 2026-09-24).
    État : clos le 2026-10-06 par #207 (tronc `76a8c3ca`) : aucun renommage, une note de registre datée, et la garde
    `scripts/adr-suffixes.mjs` (test `adr_m003_d9_suffixes_are_unique`, `adr_m003_d9_headings_never_escape_the_check`) : tout titre D9
    lu ou refusé, suffixes dans l ordre latin sans saut, aucun doublon hors de la paire octies fermée par ses dates
    (`docs/G7-lot-adr-m003-suffix-dup-1.md`).
  - ADR-M003-SUFFIX-LIST-1 (procurement, G7 de ADR-M003-SUFFIX-DUP-1) : `LATIN_ORDINALS` s arrête à octodecies, sans source primaire lue.
    Demande de procurement formée : *Guide de légistique* (Secrétariat général du Gouvernement et Conseil d État), édition en ligne sur
    legifrance.gouv.fr, fiche sur la numérotation des articles insérés (bis, ter, quater…) ; ISBN de l édition imprimée et numéro de la
    fiche à relever ; tentative : aucune ; usage : lire [lu] les termes de la liste et leurs suivants. Porteur : MONARK ; déclencheur :
    avant le premier addendum D9 au-delà d octodecies (20ᵉ titre en comptant la paire octies ; 18 aujourd hui) ; état : ouvert.
  - HARNESS-UNICODE-ESCAPE-1 (G7 de ADR-M003-SUFFIX-DUP-1) : dans l outil d écriture du harnais (Write, Edit, Bash), un échappement
    `\u` à quatre chiffres arrive dans le fichier comme le caractère brut (sonde `F:/tmp/dojo/suffixdup/escape-probe.txt`, `od -c`) ;
    la forme à accolades `\u{XXXX}` (drapeau `u` pour une expression régulière) ou `String.fromCharCode` passe. Construction : une
    ligne datée de `docs/methode/REGLES-MISSION.md` qui le dit, pour que chaque mission générée le porte. Porteur : MONARK ;
    déclencheur : le prochain lot qui touche `REGLES-MISSION.md` ; état : ouvert.
  - RETIRE-LISTS-E2A-PIPE-1 (tuyau absent de R-a, Q-R7 de son G0) : le chargeur d E-2a appelle `guardKataTable` avec `retireLists`, lues
    dans `apps/harness/data/kata/retire/` seulement, toutes, par ordre de date, sous leur nom nu ; chaque sha256 d épingle vient d une
    épingle versée, jamais du hachage des octets qu elle contrôle ; test d intégration du chemin servi ; le pas de CI de Q-E4 garde les
    tables engagées de même. Porteur : MONARK ; déclencheur : le G0 d E-2a ; état : ouvert.
  - RETIRE-CHILD-ROW-1 (Q-R8 du G0 de R-a) : trois cas d une ligne enfant (`calib_attempt` 2), impossibles aujourd hui
    (`calibAttempt` vaut 1) : la clé de tri d un enfant retiré à son tour ; l entrée de l essai 1 reprise après qu un enfant existe, qui
    heurte le contrôle d essai courant (`policy-retire.ts` l.75) ; l addendum 9 point 2 (un enfant compté à partir du premier trimestre
    dont S_k suit la fin de ses données), non contrôlé par le lecteur. Porteur : MONARK ; déclencheur : la généralisation de E-1c ;
    état : ouvert.
  - RETIRE-EVIDENCE-BIND-1 (Q-R9 du G0 de R-a ; point connu de la G2 de RECHERCHES, `8437a42`) : `evidence_sha256` d une entrée de
    liste n a que sa forme ; sa liaison au relevé des comptes LIVE est à CM-5-PLAN-1. Porteur : MONARK ; déclencheur : le premier retrait
    `live:`, pas avant le 2027-01-01 ; état : ouvert.
  - RETIRE-ADR-CAUSE-FILE-1 (point connu de la G2 de RECHERCHES, `8437a42`) : une cause `adr:decisions/<fichier>.md` est contrôlée
    dans sa forme seule ; rien ne relie la cause à un fichier qui existe, ni à son sha256. Construction : la liste publiée porte le sha256
    du fichier de décision cité, et la porte de publication (R-b) ou le chargeur d E-2a le vérifie. Porteur : MONARK ; déclencheur : la
    première liste qui porte une cause `adr:` ; état : ouvert.
  - RETIRE-HEADER-WORDING-1 (N-1 de la G2 de RECHERCHES, `8437a42`, mineure, sans nouvelle G2) : l en-tête de `readRetireList`
    (`apps/harness/src/policy-retire.ts`) se lit « E_k = S_1 plus 3k calendar months, S_1 = 2026-10-01T00:00Z ». Avec lui (note de la G2
    de R-b, `d7a5a13`) : la liste copiée dans un dossier daté porte le nom `retire-<date du dossier>.json` ; la note de version le dit
    (« the list in force at <date>, a byte copy of retire-<its day>.json »). Porteur : MONARK ; déclencheur : le prochain lot qui touche
    `policy-retire.ts`, ou la première note de version datée ; état : ouvert.
  - KILLER-ASSERT-KILL-1 (Q-R11 du G0 de R-a) : deux tueurs anciens tuent hors assertion (`guard_adr_cause_under_decisions_only`,
    `w2_guard_tail_m_and_support`), comptés « non conclu » par `scripts/mutants/run.mjs` ; un lot `red-proof: test-only` passe leurs
    admissions par une assertion. Porteur : MONARK ; déclencheur : après la fusion de R-b ; état : ouvert.
  - SPEC-WRITER-PIN-GUARD-1 (Q-Rb-9 de R-b, accord de RECHERCHES `d7a5a13`) : `writeFlat` n écrit sous `contract-1.1.0/` que les octets
    que la release `contract-1.1.0` épingle (`scripts/spec-publish-inputs.json`) ; une réécriture à d autres octets est refusée par son
    nom. Aujourd hui le filet est l épingle de la CI (six tests rougissent par assertion, mesuré au pli). Porteur : MONARK ; déclencheur :
    au plus tard le G0 court d E-2a ; état : ouvert.
  - SPEC-DATED-RELEASE-ENTRY-1 (R-b) : l entrée de release datée dans `scripts/spec-publish-inputs.json` (lignes portées `root:
    "previous"`, `previous_commit`), puis le test d épingles de `contract-1.1.0` étendu à toutes les releases (m-2 de la vérification
    de R-b). Porteur : MONARK ; déclencheur : le premier `--write --date` réel (E-2a) ; état : ouvert.
  - SPEC-TABLES-TEST-PER-DIR-1 (Q-Rb-7 de R-b) : `published_tables_are_the_served_tables_byte_for_byte` lit chaque dossier publié par
    `servedTableDirs`, et non `contract-1.1.0` seul. Porteur : MONARK ; déclencheur : le lot du premier dossier daté (E-2a) ; état :
    ouvert.
  - RETIRE-LATENCY-REHEARSAL-1 (Q-Rb-8 de R-b ; ADR 0006 D6 « livré et mesuré ») : la répétition chronométrée du retrait (liste,
    `--write --date`, release, publication, fusion, déploiement, sonde), mesurée par `scripts/retire-latency.mjs` en jours ouvrés, avec
    une cause `live:<k>` dès RETIRE-CAUSE-VOCAB-1 tranché. Porteur : orchestrateur MONARK ; déclencheur : maintenant (R-a et R-b
    fusionnées) ; état : ouvert.
    Ligne datée 2026-10-07 (MONARK, #216, fusion `ce3849a4`) : le G0 est écrit (`docs/G0-lot-retire-latency-rehearsal-1.md`), avec
    les décisions de MONARK (§10) et de RECHERCHES (§11, `ff13e11`).
    - La répétition porte sur une ligne réelle de la vague 1, en bac à sable, sur la branche du chargeur d E-2a, avec une cause `adr:`.
    - D6 se prouve en deux segments mesurés : la décision (T_a → T_c), par cette répétition ; la mise en service (T_c → T_g), par le
      cycle `publication` d E-2a. Leur somme doit tenir sous 14 jours.
    - Lots RH-1 (la sonde et l assemblage des instants), RH-2 (deux tests), RH-3 (le cycle `publication`), puis l acte.

    Items formés au G0, ci-dessous. État : ouvert.
  - RETIRE-PROBE-1 (G0 de la répétition §8) : la sonde de T_g, un outil neuf qui attend la fenêtre de grille de la classe. Porteur :
    MONARK ; déclencheur : lot RH-1, au plus tard au G0 court d E-2a ; prix ~220 lignes ; état : ouvert.
  - RETIRE-INSTANTS-1 (§8) : l assemblage de l entrée de latence à partir des preuves (commits, CA, sonde). Porteur : MONARK ;
    déclencheur : avec RETIRE-PROBE-1 (RH-1) ; prix ~150 lignes ; état : ouvert.
  - T0-ORDER-TEST-RELEASE-NAME-1 (§8 ; mesure M-1) : `srf_runbook_vitrine_t0_order` lit la dernière release de
    `scripts/spec-publish-inputs.json` (`test/surfaces-1-1-0.test.ts` l.231) et rougit à la première release datée ; il doit la
    lire par son nom. Porteur : MONARK ; déclencheur : avant la première entrée de release datée (RH-2) ; prix ~4 lignes ; état :
    ouvert.
  - RETIRE-LIST-WRITER-1 (§8) : un écrivain et un contrôleur de la liste de retrait (aucune commande ne l écrit aujourd hui).
    Porteur : MONARK ; déclencheur : le G0 d E-2a, au plus tard le premier retrait réel ; prix ~160 lignes ; état : ouvert.
  - RETIRE-REDO-MESSAGE-1 (§8) : le refus de `scripts/spec-policy-tables.mjs` l.184 imprime les commandes git qui refont un dossier
    daté avant sa publication. Porteur : MONARK ; déclencheur : le prochain lot qui touche ce script, avec RETIRE-HEADER-WORDING-1 ;
    prix ~4 lignes ; état : ouvert.
  - RETIRE-REAL-CYCLE-SCOPE-1 (§8 et §11 ; Q-RL-2 décidée par RECHERCHES, `ff13e11`) : la valeur de cycle fermée `publication` dans
    `scripts/retire-latency.mjs`, qui porte T_c à T_g. Porteur : MONARK code ; déclencheur : avant la première publication datée
    d E-2a ; prix ~45 lignes ; état : ouvert.
  - RETIRE-LATENCY-FIRST-REAL-1 (PAROXYSME ; §11, condition de RECHERCHES) : le premier retrait réel, au plus tôt `live:1` le
    2027-01-01 ou une cause `adr:` avant, est mesuré de T_a à T_g d un seul tenant ; au-delà de 14 jours, c est un écart à D6, ouvert
    en PAROXYSME. Porteur : MONARK ; déclencheur : ce premier retrait réel ; état : ouvert.
  - RETIRE-REHEARSAL-STAGING-1 (procurement, §8) : un hôte et un dépôt privé de répétition, pour mesurer T_d, T_f et T_g sur un vrai
    réseau avant le cycle réel. Décision du fondateur ; défaut « non », sans dépense ni compte, le cycle réel d E-2a mesurant ces
    actes. Prix : un hôte de plus, montant à lire sur place chez l hébergeur ; état : en attente de la décision du fondateur.
  - RETIRE-CAUSE-VOCAB-1 (Q-Rb-6 de R-b, mesuré par la vérification) : la porte de vocabulaire refuse « live » en texte public
    (`live:1` heurte la règle « a ») ; une cause `live:<k>` ne peut donc pas être publiée telle quelle. Porteur : MONARK décide,
    RECHERCHES relit ; déclencheur : avant le premier dossier daté qui porte `live:`, au plus tôt après 2027-01-01 ; état : ouvert.
  - RETIRE-RUNBOOK-1 (m-6 de la vérification de R-b) : la procédure d un retrait au RUNBOOK (liste, `--write --date`, entrée de
    release, publication, fusion, déploiement, sonde, rapport de latence ; un dossier daté à refaire avant publication se retire avec
    git). Porteur : MONARK ; déclencheur : la fusion de R-b (atteint) ; état : ouvert.
    Ligne datée 2026-10-07 (MONARK, #216, fusion `ce3849a4`) : fait. La section « Retire a kata row » de `docs/RUNBOOK-harness.md`
    décrit le retrait en neuf étapes, chaque commande citée de son fichier et de sa ligne, T_a, T_b et T_e lus comme dates du
    committer (`git log -1 --format=%cI`). Test `test/runbook-retire.test.ts`, trois tests. G2 de RECHERCHES : APPROUVE (`ff13e11`).
  - RETIRE-NEXT-CONTRACT-1 (m-4 de la vérification de R-b) : le refus d une ligne retirée hors d un dossier daté est une décision limitée
    au contrat 1.1.0 ; une version de contrat non datée pourra-t-elle publier une ligne retirée avec sa liste ? Porteur : MONARK décide,
    RECHERCHES relit ; déclencheur : le G0 de la prochaine version de contrat après 1.1.0 ; état : ouvert.
  - TEST-GIT-ENV-ISOLATION-1, inventaire (m-10 de la vérification de R-b ; item tenu à `docs/adr/ADR-BELL-OTS-PRB.md` l.263) :
    `test/spec-retire-path.test.ts` `previousTree` corrigé dans R-b (l enfant git ne reçoit ni `GIT_DIR`, ni `GIT_WORK_TREE`, ni
    `GIT_INDEX_FILE`) ; restent `test/spec-1-1-0-release.test.ts` l.214 et `test/spec-publish.test.ts` l.31. Porteur et déclencheur :
    ceux de l item ; état : ouvert.
  - R25-REGISTRY-ROOT-1, PR 2 (ADR-M003 D9 septdecies, décision de l investisseur du 2026-10-06) : copie à l octet de `wave1.json` (`recherches`
    `a43ad70`, 26 202 lignes, sha256 `811fcd57…`) et de sa déclaration `PROVENANCE-kata-registry.md` sous `apps/harness/data/kata/registry/`,
    sous la porte de la PR 1 ; l ancre (g) du test racine devient inconditionnelle (le saut est retiré). Porteur : MONARK ; déclencheur : la
    fusion de la PR 1 ; état : ouvert.
  - R25-INTEGRATION-RULE-1 (décision de l investisseur, 2026-10-05 04:2x UTC) : R-25 ne compte, sur une PR d intégration, que le neuf
    (résolutions de conflit par remerge-diff, commits hors de toute PR fusionnée et relue), contre la borne de 1 205 ; définition fermée
    de la PR d intégration et preuve d appartenance, fail-closed ; une seule source pour le job CI et la porte r25 de l oracle ; ligne
    datée d ADR-M003 D9. Porteur : RECHERCHES (zone ouverte, cahier des charges E-1 à E-7, recherches#189) ; contrôle par diff et
    oracle : MONARK ; déclencheur : avant la PR d intégration de C2 ; état : fermé le 2026-10-05 (1a #154 `58054d8c`, 1b #155
    `023801ec`, oracles Windows verts, CI verte) ; restes formés : R25-ATTR-SOURCE-1, CI-PERMS-JUDGE-YAML-1, CI-WORKFLOWS-SET-1.
  - R25-ATTR-SOURCE-1 (O-1 de la G2 de R25-INTEGRATION-RULE-1) : le compte d aujourd hui (`W`) du job r25 lu sous le même épinglage
    d attributs que le module et l oracle (un `.gitattributes` mesuré ne doit pas le baisser). Porteur : RECHERCHES (lot en cours) ;
    contrôle par diff et oracle : MONARK ; déclencheur : après 1b ; état : fermé le 2026-10-05 (#162 `d6b63e76`).
  - CI-PERMS-JUDGE-YAML-1 (PAROXYSME ; R-2 de la G2 du pli Q-2 de 1b) : le juge `problems()` des permissions de `ci.yml` est lexical ;
    il refuse les clés `? ` et les clés doubles échappées, mais ne lit ni ancres, ni alias, ni fusions `<<:`, ni étiquettes, ni scalaires
    multilignes. Construction visée : une lecture YAML réelle (dépendance vérifiée au registre d abord, R-8) ou les permissions
    effectives du jeton du run. Porteur : RECHERCHES ; d ici là, contrôle par diff des fichiers de la gate par MONARK ; déclencheur :
    avant T0 ; état : ouvert.
  - CI-WORKFLOWS-SET-1 (m-1 de la même G2) : aucun test ne lit un second fichier sous `.github/workflows/` ; l ensemble des workflows
    est `{ci.yml}`, à épingler par une égalité d ensemble. Porteur : RECHERCHES, lot à part ; déclencheur : après T0 (accord de MONARK,
    garde de CI) ; état : PR #182 vers le tronc (tête `20c645a2`, G2 pliée ; aussi : aucun `uses:` vers ce dépôt). À la fusion de T0
    (base → tronc) : réancrer le tueur de `test/ci-gates.test.ts:1962` de `scripts/export-public.mjs:425` à `:447`.
  - R25-NUL-BINARY-1 (O-a de la G2 de R25-ATTR-SOURCE-1) : un fichier dont la première ligne porte un octet NUL est lu binaire par
    git et compte 0 sous R-25, comme un sous-module ; construction visée : le compter (ou le refuser) sous les deux pathspecs. Porteur :
    RECHERCHES ; déclencheur : avant T0 ; état : fermé le 2026-10-05 (#166 `e74d39ea`, lot R25-GUARDS-1, ADR-M003 D9 duodecies :
    arbre d attributs `attrTree`, un binaire hors des actifs déclarés compte ses lignes).
  - R25-COUNT-CAP-1 (même G2) : le job r25 ne plafonne pas en bash la sortie `integration` de `count` au compte d aujourd hui `W` ;
    le module le garantit par construction, le job ne le vérifie pas. Porteur : RECHERCHES ; déclencheur : avant T0 ; état : fermé le
    2026-10-05 (#166 `e74d39ea` : le job et l oracle refusent un compte d intégration au-dessus de `W`, mode `above-written`).
  - R25-ASSET-DIR-MAGIC-1 (PAROXYSME ; reste de R-1 de la G2 de R25-GUARDS-1) : dans un répertoire d actifs déclaré, un fichier à octet
    NUL d extension déclarée compte encore 0, même s il porte du code. Construction visée : refuser sous les deux pathspecs un tel chemin
    changé dont les premiers octets ne sont pas le nombre magique de son format. Porteur : RECHERCHES ; déclencheur : avant T0 ; état :
    fermé le 2026-10-05 (#170 `c1460fd6`, lot R25-GUARDS-2, refus `asset-magic`).
  - R25-CR-ONLY-LINES-1 (PAROXYSME ; R-2 de la même G2) : R-25 compte des `\n` ; 3 001 instructions séparées par `\r` seul comptent 1
    ligne. Construction visée : compter un `\r` isolé comme une fin de ligne. Porteur : RECHERCHES ; déclencheur : avant T0 ; état :
    fermé le 2026-10-05 (#170 `c1460fd6`, refus `bare-cr`, plus `line-separator` et `utf16-bom`).
  - R25-GITLINK-SYMLINK-1 (Q-3 et N-8 de la même G2) : un sous-module (`160000`) ou un lien symbolique (`120000`) compte 1 ligne ;
    refuser le premier sous les deux pathspecs, décider du second. Porteur : RECHERCHES ; déclencheur : avant T0 ; état : fermé le
    2026-10-05 (#170 `c1460fd6` : les deux sont refusés, `--ignore-submodules=none`).
  - TRANSPORT-500-SCHEMA-1 (N-4 de la G2 de C' 3c-4a) : le 500 de transport sans `operation` contredit le schéma 500 publié de
    `/openapi.json`. Porteur : RECHERCHES ; déclencheur : avant la NOTICE de T−7 (le contrat publié doit dire vrai) ; état : fermé le
    2026-10-05 dans la base (#168 `a8ae38c0`) ; arrive au tronc à T0, avec la base.
  - SCHEMA-PROJECTION-FAIL-CLOSED-1 (N-2 de la même G2) : `inlineDefs` perd les mots-clés voisins d un `$ref` et boucle sur une
    définition récursive ; la projection doit échouer fermé. Porteur : RECHERCHES ; déclencheur : avant T0 ; état : fusionné le
    2026-10-05 dans la base (#180 `45e5c8df`, oracle Windows 2 679 tests, 0 échec ; tête du lot `eac3b03e`, G2 neuve pliée N-1 à N-6, dont DEREF-VERDICT-FAIL-CLOSED-1 ; aucun octet servi ne bouge, OpenAPI `61c9df97…`).
    Restes au G7 du lot : DYNAMIC-ELSEWHERE-1, NESTED-ID-ELSEWHERE-1, DEFINITIONS-KEYWORD-1, UNKNOWN-KEYWORD-OBJECTS-1 (défaut : laisser).
  - RELEASE-PREFLIGHT-SEND-GUARD-1 (Q-CPA-1 de C' 3c-4a) : `release-public` refuse dès son pré-vol, avant les portes locales, tant
    qu un instantané en attente existe (la garde de l export reste l autorité). Porteur : RECHERCHES ; déclencheur : avant T0 ; état :
    PR #181 vers la base (tête `d87c808c`, G2 neuve pliée N-1 à N-5). Reste pour MONARK : RPG-RUNBOOK-1, `docs/RUNBOOK-vitrine.md:34-35`
    dit encore que le refus tombe après les portes complètes (~15 min) ; après fusion, il tombe au pré-vol. Fusionnée le 2026-10-05
    (base `ec0e023d`, oracle Windows 2 680 tests, 0 échec) : fermé.
  - RPG-FLOW-DECLARED-KILLERS-1 (reste de la G2 de RELEASE-PREFLIGHT-SEND-GUARD-1, hors du chemin de T0) : le test de flux
    `release_public_flow` ne déclare qu un tueur (`release-public.mjs:211`, export refusé) ; le refus au pré-vol (`:175`) et la ligne
    RELEASE ABORTED d une liste d exclusion illisible (`:112`) ne sont tués qu à la main. Options : (a) scinder le test de flux en un
    banc partagé et trois tests, un tueur déclaré chacun (environ 40 lignes de test) ; (b) laisser, tirs à la main consignés au G7.
    Porteur : RECHERCHES ; déclencheur : le prochain lot qui touche `scripts/release-public.mjs` ; état : ouvert.
  - R25-JSON-STRING-CODE-1, R25-TOOL-RUN-JSON-1, R25-LINE-CAP-2000-1, R25-WIN32-CONTROL-PATH-1 (restes de la G2 de R25-MINIFIED-LINE-1,
    #173 `e4aac057`, refus `long-line` au-delà de 2 000 octets, exemption JSON fermée) : du code dans une chaîne d un `.json` exempté ;
    les JSON lus par un outil (liste fermée par nom) ; le seuil de 2 000 octets ; les chemins win32 à caractère de contrôle. Options et prix
    au G7 du lot. Porteur : RECHERCHES ; déclencheur : la revue d après T0, ou un JSON exempté qui devient entrée exécutée ; état : ouvert.
    (R25-REFUSAL-NAMES-1 : fermé par #173, `named()` échappe `[` et tout au-delà de U+007E.)
  - R25-ASSET-STRUCTURE-1 (durcissement de R25-ASSET-POLYGLOT-1, Q-c de la cellule : (c) réduit) : un actif déclaré qui passe son nombre
    magique doit aussi passer sa structure (PNG, JPEG, TTF, OTS, CBOR), sinon refus `asset-structure`. 0 des 45 actifs du tronc refusé.
    Porteur : RECHERCHES ; état : fermé le 2026-10-05 (#177 `74120213`, G2 fraîche approuvée, CI 10/10, oracle Windows vert).
    Restes formés au G7 du lot (§8, options et prix) : R25-ASSET-FREE-FIELD-1, R25-ASSET-PNG-DEFLATE-1, R25-ASSET-ICCP-1,
    R25-ASSET-TTF-TABLES-1, R25-ASSET-OTS-PENDING-1, R25-ASSET-CBOR-1, R25-ASSET-STRIP-1 ; et, de la G2 : R25-ASSET-FIXED-CHUNK-SIZE-1
    (taille exacte des morceaux PNG de taille fixe, environ 4 lignes) et R25-ASSET-INFLATE-CAP-1 (plafond absolu de décompression,
    environ 1 ligne ; un en-tête 16384×16384 alloue 268 Mo, échec fermé par OOM). Accord de MONARK : ces deux-là en un petit lot au tronc,
    après T0.
    R25-ASSET-POLYGLOT-1 (a) reste différé (déclencheur : un actif devient entrée exécutée, ou la revue d après T0).
  - L2-BOOK-LOAD-1 : le premier oracle de #172 (record `6b7b6571`) a vu `test/l2-book.test.ts` tomber au chargement, cause perdue ; course
    des dossiers temporaires réfutée, cause non prouvée. Témoin `keepCause` en place (#174 `89d40d7f`) ; oracles suivants verts (2 563 et
    2 571 tests). Porteur : RECHERCHES ; déclencheur : un nouvel échec (le témoin donne la cause) ; état : ouvert.
  - L2-KEEP-CAUSE-REST-1 (reste de #174) : 8 des 12 fichiers `test/l2-*.test.ts` portent le témoin `keepCause` ; les 4 autres
    (`l2-rest`, `l2-rest-tls`, `l2-fake-place`, `l2-segments`) travaillent au chargement sans lui ; environ 40 lignes, tests seuls.
    Porteur : RECHERCHES ; déclencheur : avant c6 ; état : ouvert.
  - L2-SEAL-APART-TRUNK-PORT-1 (reste de #175) : au tronc, borner l attente et libérer les FIFO dans un `finally`, comme #175 dans la
    base ; environ 12 lignes.
    Porteur : RECHERCHES ; déclencheur : la prochaine synchro tronc → base, ou avant ; état : construit (branche
    `recherches/l2-seal-apart-trunk-port-1`, `b672c5bb`, tests seuls), G2 neuve en cours. Conflit attendu sur
    `test/l2-loop.test.ts` avec #175 à la fusion de T0 : résolution donnée par la G2.
  - L2-SEAL-APART-ROOT-DELETED-FLAKE-1 (vu en construisant le port) : `l2_seal_apart_root_deleted` (`test/l2-loop.test.ts:620`) rougit
    1 fois sur 112 sous charge au tronc (`seal_timeout` après 5 s). Porteur : RECHERCHES ; déclencheur : lot c6 ; état : ouvert.
  - L2-SEAL-APART-FD-LEAK-1 (même source) : `l2_seal_apart_as_in_process` (`:389`) rougit 1 fois sur 112 sous charge (un fd 22 de trop
    chez l enfant). Porteur : RECHERCHES ; déclencheur : lot c6 ; état : ouvert.
  - L2-SEAL-APART-LATE-DEADLINE-1 (G2 de #175) : un `seal_timeout` ou un `seal_aborted` peut couvrir un jour déjà scellé par l enfant ;
    l en-tête `seal.mjs:42-43` dit plus que le code ne tient. Quand la boucle câblera `sealApart`, elle lira `day_sealed` au nouvel essai
    (`day.mjs:180`) comme un succès ; corriger l en-tête et la doc. Porteur : RECHERCHES ; déclencheur : lot c6 ; état : ouvert.
  - ORACLE-CHILD-EXIT-TRACE-1 : l oracle Windows perd la cause quand un enfant de test sort non nul au chargement (`:1:1 'test failed'`).
    Porteur : MONARK ; déclencheur : une deuxième cause perdue ; état : ouvert.
  - BELL-COURSE-TSLAX-DRIFT-1 : `docs/course-bell/mint_resume-TSLAx-manifest.txt` réécrit (`34ba9798`) sans réhorodatage ; sa preuve
    `.ots` couvre l ancien contenu (blob `a2db06d5`, la copie servie). Options : restaurer ce blob (0 code) ou réhorodater. Porteur :
    MONARK (exploitation de Bell) ; état : ouvert.
  - CANONICAL-ROW-REEXPORT-1 (coupe nommée Q-CP-8, appliquée au G0 de C' 3c-4b) : `canonicalRow` réexporte `canonicalJson` (clé non
    ASCII refusée) ; sorti du chantier 1.1.0, aucun octet servi. Porteur : RECHERCHES ; déclencheur : après T0 ; état : ouvert.
  - L2-HARNESS-FIXED-UNTIL-1 (note de l agent de #157) : des tests du harnais L2 assertent juste après un `until` à instant fixe ; sous
    charge ils peuvent échouer par assertion (pas bloquer). Porteur : RECHERCHES ; déclencheur : lot c6 de L2 P1 ; état : ouvert.
  - L2-ANCHOR-MIDNIGHT-STRADDLE-1 (d-1 de la delta G2 de c5-bis-c) : une requête d ancre à cheval sur minuit est écrite comme clôture
    de D (parité de D absente, jamais fausse) ; option `receivedUs`. Porteur : RECHERCHES ; déclencheur : lot c6 ; état : ouvert.
  - L2-JOURNAL-BROKEN-HANDLERS-1 (d-4, antérieur au lot) : sur un journal en panne, trois gestionnaires de `openLink` (`onmessage`
    binaire, `onmessage` de `serverShutdown`, `onclose`) laissent sortir la levée (`uncaughtException` sur un vrai `WebSocket`). Porteur :
    RECHERCHES ; déclencheur : lot c6 ; état : ouvert.
  - L2-LATE-US-PIN-1 (d-5) : `late_us` du saut à l envoi non épinglé (K14 survit) ; l échéance du `fetch` est nommée `error: "23"`. Porteur :
    RECHERCHES ; déclencheur : lot c6 ; état : ouvert.
  - CODEQL-ALERTS-2 (MONARK, 2026-10-05 12:2x UTC) : alertes CodeQL ouvertes sur le tronc depuis la bascule de la branche par défaut,
    #41 et #44 (`test/dojo-render.test.ts:73`, `:378`), #43 (`test/red-proof.test.ts:545`), #45 (`test/public-surfaces-honesty.test.ts:184`) ;
    #42 levée par #159 (CODEQL-42). Correction selon ADR-CODEQL-ALERTS-1 D4, sinon rejet justifié selon D6, fait par MONARK sur
    justification écrite. Porteur : RECHERCHES ; déclencheur : au plus tôt, au plus tard avant l avance de `main` à T0 (check CodeQL
    requis sur `main`, décision 170) ; état : fermé le 2026-10-05 (#159 `32aba758`, #163 `11b301a9` ; aucune alerte rejetée ;
    analyse CodeQL du tronc `11b301a9` : 0 alerte ouverte à 13:31 UTC).
  - SITE-SEND-GUARD-MECH-1 (demande de MONARK pour C') : `export-public.mjs --out` refuse tant qu un instantané en attente existe, sans drapeau de
    contournement ; la promotion à T0 lève la garde. Porteur : RECHERCHES (C', lot 3c-4a, G0 `8f554390`) ; d ici là, la règle du
    RUNBOOK, tenue par MONARK : aucun envoi du site ni release du miroir depuis la base avant C' ; état : fermé le 2026-10-05 dans la
    base (#164 `094eab83`) ; la garde arrive au tronc à T0.
  - HOST-REDEPLOY-GUARD-1 (PAROXYSME ; Q-CP-5 du G0 de C') : la règle m-1 (redéployer l hôte depuis le SHA déployé seulement, jusqu à
    T0) est une règle de procédure ; construction visée : une garde mécanique dans le script de déploiement de MONARK. Porteur :
    MONARK ; déclencheur : avant le prochain redéploiement de l hôte ; état : ouvert.
  - MUTANTS-RUN-EXIT-CODE-1 (signalé par RECHERCHES, 2026-10-04) : `scripts/mutants/run.mjs` juge un mutant sur la sortie, pas sur le
    code de sortie ; un rapport d échec perdu donne « survit » au lieu de « tué » (sens sûr, mesure fausse). Construction : juger sur le
    code, tests et tueur d abord. Porteur : RECHERCHES (zone `scripts/mutants/` ouverte, recherches#154) ; état : fermé (#144 `16860fdd`).
  - L2-MARKET-STREAMS-CASE-FAITS-1 (Q-A4-1 du G0 de L2 P1-a4) : les flux `/market` sont en minuscules ; la ligne FAITS qui le prouve
    sur la page primaire est due avant M-1. Porteur : RECHERCHES ; déclencheur : M-1 ; état : ouvert.
  - L2-RECV-US-RESOLUTION-1 (PAROXYSME ; Q-4 du G1 de L2-P1-a2) : Node n offre aucune horloge murale à la microseconde ; `recv_us`
    de production vaut `Date.now()*1000` (résolution ms), l ordre fin étant porté par `mono_ns`. Construction qui donne la garantie :
    mesurer la résolution réelle et la dérive de `performance.timeOrigin + performance.now()` contre l horloge de l hôte sur un jour
    de M-1, ou un module natif (R-8). Déclencheur : avant le G1 de P1-c4 ; prix : une mesure ; état : ouvert.
  - CM-2b-TOOLS-1 (outil ; C-7 du contrôle de CM-2b, mesuré le 2026-10-04) : (a) `scripts/mutants/run.mjs` ne tourne pas sur un arbre
    rouge par construction (base rouge, tout « non conclu ») ; construction : une option `--skip-tests` ou `--exclude-targets` (contournement
    mesuré : `NODE_OPTIONS=--test-skip-pattern`) ; (b) pour un fichier de test en échec, l oracle ne garde que « test failed » sans
    stderr ; construction : garder cette stderr au journal. Prix : environ 20 lignes et 2 cas. Déclencheur : le prochain lot de l outil ;
    état : ouvert.
  - Décision de l investisseur (2026-10-04, 01:2x UTC, C-2 du contrôle de CM-2b), choix verbatim « Dire la vérité dans la description
    (Recommandé) » : la description servie dit qu aucune classe servie n a de sujet d attestation, donc que tout `attested` est refusé ;
    porté par RECHERCHES (#110 ou une suite), avant le déploiement commun de CM-2a et CM-2b.
  - SEAL-118 : **fait le 2026-10-04 à 02:59 UTC** (forme B, rejeu hors ligne par `9842d42d`, 472 fichiers, 118 sur 118 vérifiés ; journal
    de provenance ; ancre recherches#94). Reste des 153 : la course des 35, après la fusion de BINANCE-PRE35-1 (#115).
    Copies de travail sous `F:/tmp/seal118` (428 Mo) : décision de l investisseur (2026-10-04, 03:3x UTC, choix verbatim « Après le
    scellement des 35 (Recommandé) ») : supprimées après le scellement des 35 ; ancre, outils et rapports gardés.
    Copies de travail de la course des 35 (`C/stage`, `C/refetch118`, `C/replay`, `C/verif`, `C/arrets` après copie de leurs journaux) :
    décision de l investisseur (2026-10-04, 05:3x UTC, choix verbatim « Après le scellement vérifié (Recommandé) ») : supprimées après
    le scellement vérifié des 35, avec celles de `F:/tmp/seal118` ; journaux, ancre, outils et rapports gardés (Q-C35-3 du PLAN-COURSE-35).
    Nom de produit confidentiel présent dans 15 documents anciens de `monark-governance` (public) : décision de l investisseur (même heure,
    choix verbatim « Rien, c est voulu ») : il y reste ; l outil SPEC-PUBLISH-PIPELINE-1 le bloque par empreinte dans ce qu il produit.
  - SEAL118-PAGES-REFETCH-1 (PAROXYSME ; Q-SEAL118-4) : les pages des 118 ne sont attestées que par le journal du 2026-10-02, sans
    provenance TLS (Q-G2C-1). Construction : redemander les mêmes 140 URL par l enregistreur du tronc, qui journalise les empreintes TLS,
    et comparer à l octet. Prix : 140 requêtes de poids 2, environ 70 s, aucun coût. Déclencheur : avec la course des 35 ; état : ouvert.
  - LINT-UNTRACKED-TMP-1 (zone MONARK, `test/journal-index.test.ts:323`, copie `cpSync` l.84) : rouge dans la CI Linux de #110 (run
    37169648100) sur `ENOENT` sous `/tmp/monark-journal-…/w106/.git/objects` ; vert ici. Construction : rendre la copie du dépôt de test
    indépendante du nettoyage concurrent de `/tmp` (dossier propre au test, copie atomique), et un cas qui la rejoue sous charge.
    Déclencheur : le prochain lot d outillage ; état : ouvert (critique K-5 des contrôles de #107 à #112).
    **Clos le 2026-10-04** par le lot LINT-UNTRACKED-TMP-1 (PR #118 de RECHERCHES, fusion au tronc `8732e9b0`, oracle : seuls les 2 rouges
    du temps (ii)) : la cause était la maintenance détachée de git (≥ 2.47) qui tient puis supprime `.git/objects/maintenance.lock` ;
    `maintenance.auto = false` dans la config du test, copie qui saute les `*.lock` sous `.git/` ; 6/2 400 → 0/2 400.
  - CPSYNC-LIVE-REPO-ABORT-1 (information, RECHERCHES) : un `cpSync` natif non filtré d un dépôt git vivant peut faire avorter tout le
    processus de test. Déclencheur : tout test neuf qui copie un dépôt vivant ; état : ouvert.
  - Temps (ii) de BTC-DIR-RETIRE-SURFACES-1 complété (critique K-4) : `apps/site/data/ukemi-served.json` par `scripts/sync-ukemi-served.mjs`,
    après la CA, avec `harness-served.json` et `narabi-served.json` ; et `integration_test` de Shōgen : `probe_harness_records_real_decision`
    en tête, puis les deux tests plus faibles et les deux tests unitaires de la jointure (critique K-6, décision de l orchestrateur).
  - SENTINEL-SIGTERM-LOAD-1 (zone RECHERCHES, `apps/sentinel/test/sentinel-chainstack-guard.test.ts:321`) : le test
    `sentinel_run_releases_chainstack_lock_on_sigterm` rougit sous la charge de la CI exportée (test 42, run 37169648100 de #110 ; déjà
    vu par RECHERCHES à la base) et passe seul. Construction : borne de temps du test tenue par un événement, jamais par une durée.
    Déclencheur : signalé à RECHERCHES le 2026-10-04 ; état : ouvert.
  - L2-DATA-STREAM-BASE-1 (mesure ; Q-P1-3 du plan de P1) : la base `wss://data-stream.binance.vision` (moindre privilège) n a ni port
    ni règle des 24 h écrits ; P1 part sur la base générale. Construction : mesurer port, durée de connexion et règles à M-1, puis basculer
    si elles égalent celles de la base générale. Déclencheur : M-1 ; état : ouvert.
  - FAITS-L2-ACCESS-3-E-1 (procurement ; (e) de FAITS-L2-ACCESS-3, non établi le 2026-10-04) : `timeUnit` sur les routes futures ;
    absent des deux pages « legacy » lues ; la page neuve (`…/ws-streams/public`) ne rend pas son corps dans le navigateur interne.
    Construction : la lire par le navigateur externe ou par le fichier source de la page, datée et épinglée. Déclencheur : avant le G1
    de P1-a4 ; état : ouvert.
  - I-2 de RECORDER-CLOSE-TIME-1, tuyau des listes `irregular_close` et `zero_trade` (branchement) : déclarer entrée, sortie, état et test
    de composition ; la pièce reste « upcoming » tant qu'aucun chemin servi ne les lit. Source : `ct/corr/CORR.md` l.123. Déclencheur :
    G7 de la partie USDT/USD, non atteint (HANDOFF, Q-5) ; état : ouvert. Absorbe Q-CTV2-3 de BINANCE-V2-1 (G2-CTV2-5) : `v2` est le
    format de ce tuyau ; aucun dossier v2 sous `F:/PRODUITS/marche/` (798 manifestes, tous v1 : `ctv2/corr/CORR.md` l.50-53) ; lecteur
    aval annoncé par RECHERCHES : W2C-ADAPTER-V2-1 (refuse tout schéma autre que `monark.series.binance.v2`).
  - SERIES-TLS-PEER-LOG-1 (I-7, nom confirmé : HANDOFF, Q-7) : journaliser, par requête, les empreintes du certificat feuille et de son
    émetteur dans `requests.jsonl`. Source : `ct/corr2/CORR2.md` l.106. Déclencheur : avant la première course en ligne Binance, la course
    des 35. **Clos le 2026-10-04** par BINANCE-PRE153-1 (fusion `328be484`) : un abonné de module à `undici:client:connected` (l.96-108)
    lit à la poignée de main le sha256 DER de la feuille et de l'émetteur, marque `resumed: true` une session reprise et ne lève
    jamais ; chaque requête est liée à sa connexion par `undici:client:sendHeaders` (l.221-230) ; champ `tls` de la ligne d'arrivée
    (l.233) ; un 200 sans certificat s'arrête `tls_unattested` avant son corps (l.236) ; tests l.923, l.1030, l.1076 et l.1110 ; mutants
    `343e6c40...`, 100 sur 100. Limites : L-1, la lignée d'une session reprise est déduite du cache de sessions d'undici (item proposé
    SERIES-TLS-RESUME-1, `bnpre/G1.md` l.130) ; O-1, deux AC de même nom confiées dans un processus ont fait lire l'autre émetteur (item
    proposé SERIES-TLS-ISSUER-BY-NAME-1, `bnpre/corr/CORR.md` l.103) ; Q-2 du recensement ; L-3 : mesure jointe à SERIES-PROXY-GUARD-1 ;
    l'abonné `bind` sans `try` : BINANCE-BIND-SUBSCRIBER-TRY-1 (ci-dessous).
  - BINANCE-REPLAY-NON200-ATTEST-1 (mutants) : le filtre de statut de `logged` n'est épinglé par aucun test, le mutant R4 survit
    (un rejeu sur une page posée au curseur d'une réponse non 200 écrit au lieu de s'arrêter `raw_page_altered`) ; tueur mesuré,
    prix environ 10 lignes de test. Source : `F:/tmp/rech/mutfusion/JOURNAL.md` section 5. Déclencheur : tour de corrections du lot
    BINANCE-V2-1, qui touche l'enregistreur, au plus tard avant le premier rejeu d'un enregistrement arrêté ; état : clos le 2026-10-03 :
    test `binance_klines_refuses_a_page_planted_at_the_cursor_of_a_non_200_answer` (tueur l.792 vers l.149), R4 tué
    (`F:/tmp/methode/ctv2/mutants/RESULTS.json` `85829d1c...`, P1 et K26 `strict`) ; épingle verte à la base ; fusion `c2787443`.
    Au tronc `328be484` (BINANCE-PRE153-1) : le filtre est l.201 (statut 200 et ligne complétée, champ `sha256`), le test l.878, son
    tueur l.877 vise l.201, tué dans `bnpre-corr/mutants` `343e6c40...` ; même classe pour un 200 arrêté `tls_unattested` : une page
    posée à son curseur est refusée au rejeu (test l.1110).
  - BINANCE-OPENSSL-PREFIX-PIN-1 (mutants ; O-RR3-1) : le mutant E2 refuse le nom `OPENSSL` sans tiret bas, que le code livré admet ;
    aucun test n'épingle cette frontière. Tueur mesuré : ce nom ajouté au cas proche du test de la garde de confiance ; prix : un nom
    dans une liste existante. Source : idem. Déclencheur : celui de BINANCE-REPLAY-NON200-ATTEST-1 ; état : clos le 2026-10-03 : nom
    `OPENSSL` dans l'environnement de `near` du test l.605, E2 tué (`85829d1c...`, P2 `strict`) ; fusion `c2787443`. Le tueur déclaré de
    ce test reste l.58 : une campagne future ne rejoue E2 que par une ligne de table (O-CORR-1 ; Q-4 du recensement).
    Depuis BINANCE-PRE153-1 (fusion `328be484`), la liste de refus est retirée : `OPENSSL` est refusé comme tout nom hors des douze
    admis (`env_refused`, cas `near` du test l.684, l.705-709) ; la frontière que visait E2 n'existe plus ; le tueur déclaré du test
    vise la liste admise (l.683 vers l.71).
  - MUTANTS-MULTI-LINE-1 (outillage) : `scripts/mutants/run.mjs` n'applique qu'une ligne par mutant ; les mutants de revue cb M42
    et L01, sur deux lignes, sont restés hors campagne. Construction : une ligne de table à plusieurs éditions appliquées d'un bloc,
    et son test ; prix environ 10 lignes d'outil et 10 de test. Source : idem. Déclencheur : prochain lot qui touche l'outil, ou
    prochaine table portant un mutant sur plusieurs lignes ; état : ouvert.
    **Clos le 2026-10-04** par le lot MUTANTS-TOOL-2 (corrections après la G2 neuve ; fusion au tronc `b47de143`).
  - Campagne de mutants de fusion des trois lots, 2026-10-03, par l'outil du tronc : 215 mutants, 204 tués, 11 survivants ;
    équivalents prouvés par raisonnement et mesure : ct M3, ee7 P4 et N12, cb M55 ; les sept autres portent les items ci-dessus.
    Preuves : `F:/tmp/rech/mutfusion/` (empreintes : `DELIVERED.sha256`).
  - Déjà dans ETAT, cités et non doublés : REPLAY-INTERVAL-BIND-1 (I-1) et RECORDER-CLOSE-TIME-1, mis à jour à leur place (Katas,
    vague 2) ; PS-C-WRITE-1, alias METHODE-PS-LOCALAPPDATA-1 (I-6), mis à jour à sa place ; LOOPBACK-SEQUENTIAL-PORTS-1 et
    RED-PROOF-CHILD-STDERR-1, non touchés par les lots.
  - Clos dans les tours, preuves au recensement : COINBASE-WINDOW-BOUND-1, COINBASE-IGNORED-WINDOW-1, COINBASE-WINDOW-MARGIN-1,
    COINBASE-TIMEOUT-ASSERT-1, COINBASE-XWINDOW-CONFLICT-1, COINBASE-WINDOW-CONSISTENCY-1, COINBASE-MARGIN-ONLY-SLOT-1,
    COINBASE-EMPTY-CORE-CHECK-1, COINBASE-STALLED-BODY-LOG-1, et des deux côtés SERIES-REPLAY-INTEGRITY-1 et SERIES-TLS-CA-ENV-1 ;
    absorbés : COINBASE-EE7-PIPE-1, BINANCE-BODY-BOUND-1, BINANCE-TLS-CA-ENV-1, BINANCE-ABSENT-ROOT-TEST-1, I-3 (par Q-U5),
    SERIES-TLS-TRUST-ENV-1 (I-5).
  - Actes de l'orchestrateur en cours, non re-décrits (recherches#71 ; `docs/HANDOFF-2026-10-02-publication.md` l.479-485) : relecture de
    l'enregistreur Coinbase par RECHERCHES, sonde Q-U4, Q-U3, Q-U5, premier mois Coinbase, scellement des 118, course des 35.
    Au 2026-10-03, lots de l'addendum 7 : la sonde Q-U4 est COINBASE-PROBE-RUN-1 (ci-dessous) ; Q-U3 et Q-U5 sont répondues (addendum 7
    W1 à W4 ; identifiant `v2` des manifestes des deux enregistreurs) ; le premier mois Coinbase se lit en deux passes (addendum 7 R1) ;
    l'enregistreur Binance est relu CONFORME par RECHERCHES au sha `6fcee7c0` (feu pour les 118 puis les 35), sha que BINANCE-PRE153-1 a
    changé : relecture au sha final, avant les 118 et les 35 (HANDOFF du tronc, 19:00 UTC ; message à RECHERCHES du 2026-10-03, ADR L2
    acceptée, `2633e7d5...`, l.31-37). Au 2026-10-04, BINANCE-PRE153-1 et COINBASE-PASS-EDGES-1 sont fusionnés (`328be484`,
    `44d8892d`) ; sha256 au tronc : enregistreur Binance `9842d42d...`, enregistreur Coinbase `dccb218d...`, comparaison `2e7f9f75...`,
    sonde `4660115a...` ; pièces de la relecture : `F:/tmp/rech/itemsseries/pieces/` (`SHA256SUMS` `9b82d78a...`). Déjà dits à
    RECHERCHES : les deux ancres du manifeste `binance.v2` et `witness_slots` (message du 2026-10-03 cité) ; `empty_witness_pages`
    (accusé de Q-5, même jour, `2adb9d76...`) ; la branche de sa règle des pages de témoins seuls que la garde de fin commune rend vide
    (Q-CORR-1 de COINBASE-PASS-EDGES-1), la ligne d'arrivée puis la ligne complétée de `requests.jsonl`, `env_refused` et
    `tls_unattested` (message du 2026-10-04, partage de charge, section 5, `d570cdec...`). À dire avec la demande : la famille de
    `proxy_refused`, une variable de mandataire ou un drapeau de node (Q-CORR-BNPRE-5).
- **Items des lots de l addendum 7, de BINANCE-V2-1 et de CM-1, 2026-10-03** (lots COINBASE-ADD7-1, BINANCE-V2-1 et EE7-ADD7-1,
  fusionnés au tronc `09ed61c5`, `c2787443` et `e970c488`, et contrôle de CM-1 ; sources : journaux, revues, corrections et re-revues
  sous `F:/tmp/rech/`, dossiers `cbadd7`, `ctv2`, `ee7add7`, `cm1rev`, `cm1rr` ; recensement complet, clos et absorbés compris, avec
  preuves et questions : `F:/tmp/rech/itemsadd7/JOURNAL.md` (empreinte : `F:/tmp/rech/itemsadd7/DELIVERED.sha256`) ; propriétaire :
  orchestrateur, sauf mention) :
  - COINBASE-PASS-SHARED-BOUND-1 (PAROXYSME, mesuré) : les deux passes partagent le `start` de leur première requête et le `end` de leur
    dernière ; une omission liée à ces seules requêtes est scellée fausse dans les deux et la comparaison sort 0 : [0, 148) et la bande
    de fin propre à la longueur du mois (5 à 144 créneaux ; 292 sur 2 976 pour un mois de 31 jours). Construction acceptée par
    RECHERCHES : la passe 2 ouvre par un coeur qui commence 149 créneaux avant le mois et ferme par un coeur qui finit 149 créneaux après,
    témoins hors du mois comptés, jamais écrits ni comparés ; RECHERCHES demande la relecture de 2022-08 par cette passe avant la boucle.
    Source : `cbadd7/G1.md` l.341-348 et l.407-425, `cbadd7/g2/G2-RAPPORT.md` l.163-204 (G2-1), messagerie de RECHERCHES (bords de
    mois Coinbase, 2026-10-03). Déclencheur : avant la boucle des 49 mois ; prix : au plus une requête de plus par mois, environ 40
    lignes de code et 60 de tests. **Clos le 2026-10-04** par COINBASE-PASS-EDGES-1 (fusion `44d8892d`) : passe 2 sur [`--start` - 149,
    `--end` + 149) créneaux (`record-coinbase-candles.mjs` l.128-135), témoins comptés (`witness_slots`, l.289, l.313, l.325) et
    contrôlés par la comparaison (l.89-97) ; pour toute fenêtre, aucune borne commune aux deux passes : la seule possible, une fin quand
    la fenêtre fait 149 créneaux modulo 298, est refusée avant toute requête (`sharedEnd` l.140-143, `bad_pass` l.343-344) et par la
    comparaison (l.126-127) : G2-1 de sa G2 (`cbedges/g2/G2-RAPPORT.md` l.266-284). Tests de l'enregistreur l.486 (11 requêtes par mois
    sur 50 mois), l.746, l.788 et l.836 (149 et 447 créneaux : aucune requête) ; de la comparaison l.193, l.221 (mois de 28 à 31 jours,
    rouges à la base) et l.258 ; preuve rouge `F:/tmp/methode/cbedges-corr/red-proof/RED-PROOF.json` `f9a5b436...` (11 sur 11) ; mutants
    `321da4a1...`. Restent des actes : 2022-08 relu par cette passe avant la boucle (demande de RECHERCHES) ; le plan des courses porte
    11 requêtes par mois en passe 2 (550 sur les 50 mois) et ne lance une passe 2 qu'après `--end` + 37 h 15 (`cbedges/G1.md`
    l.340-344).
  - EE7-MANIFEST-READ-1 (correction 5 de RECHERCHES) : faite par EE7-ADD7-1 pour les cinq clés (`schema` v2, `product`,
    `granularity_s`, `end_exclusive`, `recorder_sha256` : détecteur l.154-162) ; reste ce que l'item exige « désormais » : `pass = 1` et
    `empty_pages = 0`, que le détecteur ne lit pas (`empty_pages` vaut 0 dans tout manifeste écrit ; `pass` n'est contrôlé nulle part).
    Source : `cbadd7/G1.md` l.349-353. Déclencheur : avant la première course du détecteur sur un mois scellé ; prix : environ 10
    lignes et un test ; état : ouvert pour ce reste, porteur à trancher (Q-1 du recensement : COINBASE-PASSES-PIPE-1, ou le détecteur).
  - COINBASE-PASSES-PIPE-1 (branchement) : la sortie de la comparaison des passes n'a pour consommateur que le plan ; construction : le
    détecteur refuse un mois sans son scellé de mois (`coinbase-passes/<mois>.sha256`, qui lie les deux SHA256SUMS et la sortie verte de
    la comparaison), et un test d'intégration passe 1, passe 2, comparaison, détecteur sur un mois imité, avec TUYAU-EE7-IN-1 (G2-15).
    Source : `cbadd7/G1.md` l.354-359. Déclencheur : fusion de l'enregistreur et du détecteur, atteint (`09ed61c5`, `e970c488`) ; prix :
    environ 15 lignes et un test d'environ 40 ; état : ouvert ; d'ici là, ni la comparaison ni la sonde ne sont « built ».
  - COINBASE-PROBE-RUN-1 (acte ; la sonde Q-U4) : course réelle de `scripts/probe-coinbase-bounds.mjs` (3 requêtes BTC-USD sur une
    semaine de 2026-09) ; `probe.json` scellé posté à RECHERCHES ; `readings` vide ou `format_accepted` faux : P3 (correction et
    relecture avant toute requête USDT-USD). Noter G2-10 : la sonde contrôle la forme d'une bougie moins que l'enregistreur (une forme
    refusée se verrait au premier mois par un arrêt nommé). Source : `cbadd7/G1.md` l.284-287 et l.360-362. Déclencheur : après la G2
    du lot, atteint ; prix : 3 requêtes et une lecture ; état : ouvert ; ordre annoncé : campagne de fusion, la sonde, puis 2022-08.
    La course attendait COINBASE-PASS-EDGES-1 (Q-12, décidée : HANDOFF du tronc, 2026-10-03 21:31 UTC), fusionné le 2026-10-04
    (`44d8892d`) : la sonde qui tournera est au sha256 `4660115a...`, ses corps lus en flux bornés (l.105-107).
  - COINBASE-MUTANTS-ADD7-1 (mutants) : campagne par l'outil du tronc sur les lignes neuves de l'enregistreur, de la comparaison et de
    la sonde. Source : `cbadd7/G1.md` l.363-366. Déclencheur : fusion du lot, atteint (`09ed61c5`) ; prix : une campagne (déjà mesurées
    sur ces lignes : 78 sur 100 à la G2, 76 sur 76 au correcteur). **Clos le 2026-10-04** : campagne de fusion des trois lots faite
    (MUT-FUSION-ADD7-1, `F:/tmp/rech/mutadd7/JOURNAL.md` `e098ba89...` l.533-535 : 612 mutants, 601 tués, 7 équivalents prouvés, 4 non
    équivalents) ; pour ce lot (l.264-267, l.378-383) : 268 mutants, 262 tués, S13 et M55 équivalents prouvés, XC-G02, XC-G03, XP-G02 et
    XP-G03 non équivalents, tués au tour de corrections de COINBASE-PASS-EDGES-1 (Q-MA-7 ; `cbedges-corr/mut-2/RESULTS.json`
    `321da4a1...`, stricts ; fusion `44d8892d`).
  - EE7-RECORDER-IDENTITY-1 (détecteur) : `recorder_sha256` n'est contrôlé qu'en forme (64 hexadécimaux) ; fermer la chaîne de
    scellement exige l'identité de l'enregistreur relu (son sha256, ou une liste fermée de versions) et son report par mois. Source :
    `ee7add7/g2/G2-RAPPORT.md` l.218-223 (C-6), `ee7add7/corr/CORR.md` l.50 (D-8). Déclencheur : avant le premier hachage d'une liste
    H-EE-7 ; prix : chiffré à son déclencheur (HANDOFF, Q-11) ; état : ouvert.
  - BINANCE-REPLAY-SCHEMA-LIST-1 (nom proposé ; Q-CTV2-1, PAROXYSME) : le rejeu lit le manifeste source pour son intervalle seul ; un
    schéma inconnu ou absent n'est pas refusé (sonde de la G2 : v3, sans schéma, `coinbase.v1`, v2 sans listes, rejoués `ok`, la
    sortie étant recalculée depuis `raw/`). Construction : liste fermée des schémas lus (`binance.v1`, `binance.v2`), arrêt nommé neuf
    `schema_unknown` avant toute écriture, un test. Source : `ctv2/G1.md` l.114, `ctv2/g2/G2-RAPPORT.md` l.56-58. Déclencheur : avant
    le premier rejeu d'une source qui n'est ni un scellé v1 (48aa58b3, 0a1ae564) ni un dossier de cet enregistreur ; prix : environ 25
    lignes R-25, jusqu'à 65 si une ligne s'insère (estimation, exact au G0) ; état : ouvert.
  - MUTANTS-TYPECHECK-1 (outillage ; PAROXYSME) : `scripts/mutants/run.mjs` ne lance que `node --test`, un mutant de type (`.d.mts`) y
    survit toujours. Construction : une ligne de table marquée `typecheck` fait lancer `tsc --noEmit -p tsconfig.json` dans le clone de
    l'outil (tué si erreur dans un fichier cible), et son test ; à fondre avec MUTANTS-MULTI-LINE-1 si un même lot touche l'outil.
    Source : `ctv2/corr/CORR.md` l.212-219 (Q-CORR-3). Déclencheur : la campagne de fusion de BINANCE-V2-1 (en cours sans ce mode :
    T1 à T4 n'ont de preuve que par pilote), ou le prochain lot qui touche l'outil ; prix : environ 30 lignes d'outil et 25 de test
    (estimation) ; état : ouvert.
    **Clos le 2026-10-04** par le lot MUTANTS-TOOL-2 (corrections après la G2 neuve ; fusion au tronc `b47de143`).
  - MUTANTS-REPLAY-NONCONCLU-1 (outillage) : l'outil de mutants ne rejoue sur toutes les cibles que les « survit » ; un mutant rouge
    sans assertion au premier passage reste « non conclu » (M32 de CM-1). Construction : rejouer aussi les « non conclu », et son test.
    Source : `cm1rr/RAPPORT.md` l.67 (F-1, voie (c) ; la voie (b) est faite dans la PR #104). Déclencheur : le prochain lot qui touche
    l'outil (proposé, Q-8 du recensement) ; prix : chiffré à son déclencheur ; état : ouvert.
    **Clos le 2026-10-04** par le lot MUTANTS-TOOL-2 (corrections après la G2 neuve ; fusion au tronc `b47de143`).
  - MUTANTS-LOCK-MIDRUN-1 (outillage ; item antérieur absent d'ETAT, `docs/adr/ADR-RPC-GUARD-DRAND-1.md` l.134) : l'outil de mutants
    ne lit le verrou d'hôte qu'au lancement ; un oracle d'un autre lot peut le prendre en cours de campagne. Deux chevauchements le
    2026-10-03 (`cbadd7/corr/CORR.md` l.231-238 ; `ee7add7/corr/CORR.md` l.173-179) ; les arbres concernés sont rejoués verts par les
    oracles G7 du tronc. Parade d'ici là : la garde externe de REGLES-MISSION. Déclencheur et prix : non écrits dans les sources lues
    (Q-3 du recensement) ; état : ouvert.
    **Clos le 2026-10-04** par le lot MUTANTS-TOOL-2 (corrections après la G2 neuve ; fusion au tronc `b47de143`).
  - RED-PROOF-PIN-1 (outillage ; item antérieur absent d'ETAT, `docs/adr/ADR-METHODE-2.md` l.22 et l.62, lot M-4b) : `red-proof.mjs`
    refuse un test vert à la base ; la catégorie « épingle » (tueur tué, `<before>` présent à la base, comptée à part) n'est pas au
    tronc (0 occurrence de `pins`). Les trois tours de corrections du 2026-10-03 y ont buté (`ctv2/corr/CORR.md` l.193-196,
    `ee7add7/corr/CORR.md` l.191-195, `cbadd7/corr/CORR.md` l.200-209), réglés par décision de l'orchestrateur. Déclencheur du lot
    M-4b : G7 de M-6, atteint ; prix : au plus 547 lignes ; état : ouvert.
    Deux tours de plus y ont buté le 2026-10-03 : COINBASE-PASS-EDGES-1 (tueurs des gardes d'exécution placés dans des tests rouges à la
    base, `cbedges/corr/CORR.md` l.80-88 et l.289-293, Q-CORR-2) et BINANCE-PRE153-1 (cas G18 plié dans un test déjà jugé, vert à la
    base, `bnpre/corr/CORR.md` l.63).
  - HARNESS-BYO-400-RATE-1 (nom proposé ; mesure) : le nombre de clients touchés par B-0 et B-1 de CM-1 n'est pas mesuré ; borne : le
    taux de réponses 400 sur `POST /gate` dans `harness-access.log` (route et statut, aucun corps), sur une fenêtre avant et une après
    le déploiement de l'arbre qui les porte. Source : `cm1rev/RAPPORT.md` l.164 et l.181 (Q-6). Déclencheur : l'acte (3) de l'ordre de
    déploiement retenu, atteint le 2026-10-03 à 22:33:46 UTC. Fenêtre avant (7 jours jusqu'à 22:31 UTC) : 4 `POST /gate`, tous 200,
    2 clients distincts (comptes agrégés, sondes de MONARK exclues). Fenêtre après : 7 jours depuis 22:33:46 UTC, lue le 2026-10-10
    après 22:34 UTC par le même outil (`/root/d3-rate.mjs` sur l'hôte, copie `F:/tmp/deploy3/rate.mjs`) ; état : ouvert.
  - HOST-HARNESS-PREV-1 (hôte du site) : l'arbre servi avant l'étape 3 est gardé avec ses modules sous
    `/opt/monark-harness.prev-20261003-2231` (retour arrière : deux renommages et un redémarrage), avec la sauvegarde
    `/opt/monark-harness.bak-20261003-2231.tgz` ; l'arbre servi porte encore 4 fichiers absents de `6da4504d`
    (`apps/sentinel/src/rpc.ts.prev`, `apps/site/app/products/page.tsx`, `apps/site/lib/narabi-snapshot.ts`,
    `packages/monark/test/cross-agent-gate.test.ts`), hors du chemin du harnais et de la sentinelle. Construction : les retirer, et
    l'arbre précédent, sur accord de l'investisseur (suppression) ; déclencheur : le prochain déploiement du harnais ; état : ouvert.
    Relevé du 2026-10-04 à 23:3x UTC : trois arbres gardés (`.prev-20261003-2231`, `.prev-20261004-0742`, `.prev-20261004-2331`) et
    huit sauvegardes `.bak-*.tgz` (11 Go utilisés sur 96). Le processus du harnais, lancé à 07:44:08 UTC et non redémarré par le
    déploiement de la sentinelle, a pour répertoire de travail l arbre renommé `.prev-20261004-2331` : à ne retirer qu après le
    prochain redémarrage du harnais.
  - Clos ou absorbés dans ces lots, preuves au recensement : EE7-SCHEMA-V2-1 (le détecteur lit `monark.series.coinbase.v2`), Q-CTV2-3
    (dans I-2), et à leur place plus haut : COINBASE-MUTANTS-CORR-1, COINBASE-PLAN-ENVOK-OPENSSL-1, TUYAU-EE7-IN-1,
    BINANCE-REPLAY-NON200-ATTEST-1, BINANCE-OPENSSL-PREFIX-PIN-1, partie EE-7 de MAIN-GUARD-REALPATH-1 ; Q-8 (copies sous `F:/tmp`) :
    clos au HANDOFF du tronc (19:00 UTC).
  - Existants mis à jour à leur place : COINBASE-BOUNDS-READ-1, COINBASE-TRUNCATION-RESIDUAL-1, COINBASE-HOLE-WINDOW-1,
    SERIES-ENV-ALLOWLIST-1, SERIES-BODY-BOUND-1, SERIES-ERROR-BODY-1, MAIN-GUARD-REALPATH-1, EE7-WINDOW-LEADIN-1, PROBE-NARABI-LOAD-1,
    I-2, SERIES-TLS-PEER-LOG-1, les actes en cours, PS-C-WRITE-1, VERIFY-TEST-DEAD-CHILD-2, REPLAY-INTERVAL-BIND-1 (Katas). Questions
    ouvertes des journaux et de ce lot : au recensement (HANDOFF, Q-9).
- **Items des lots COINBASE-PASS-EDGES-1 et BINANCE-PRE153-1, 2026-10-04** (fusionnés au tronc `44d8892d` et `328be484` ; sources :
  journaux, revues, corrections et re-revues sous `F:/tmp/rech/`, dossiers `cbedges` et `bnpre` ; recensement complet, avec preuves et
  questions : `F:/tmp/rech/itemsseries/PROPOSITION.md` (empreinte : `F:/tmp/rech/itemsseries/DELIVERED.sha256`) ; propriétaire :
  orchestrateur, sauf mention) :
  - COINBASE-WITNESS-PAGES-COMPARE-1 (comparaison ; Q-CORR-5 de COINBASE-PASS-EDGES-1) : la comparaison ne lit pas `empty_witness_pages`
    (0 occurrence dans `compare-coinbase-passes.mjs` au tronc), que l'enregistreur écrit en passe 2 seule (l.325). Construction : dans
    `run`, à côté de `witnessesOk`, l'exiger absente en passe 1 et entière, 0 ou 1, en passe 2 (un seul coeur peut commencer dans les
    149 créneaux d'après le mois), sinon `not_comparable { pass, file }` ; trois cas dans la table du test l.258. Source :
    `cbedges/corr/CORR.md` l.298-301 et l.318-322, `cbedges/rr/G2-RAPPORT.rr.md` l.131-133 (F-2). Déclencheur : avant la première
    lecture d'un mois en deux passes ; prix : environ 2 lignes exécutables et 4 de test, une campagne ; état : ouvert.
  - BINANCE-BIND-SUBSCRIBER-TRY-1 (enregistreur Binance ; Q-CORR-BNPRE-3, seconde moitié de G2-BNPRE-4) : l'abonné `bind` de `livePage`
    (`record-binance-klines.mjs` l.222) n'a pas de `try` : une publication `undici:client:sendHeaders` sans `request` pendant un `fetch`
    de l'enregistreur lèverait (théorique : undici publie toujours `request`). Construction : un `try` dans `bind` et un cas (une
    publication sans `request` pendant une requête de bouclage tenue ouverte). Source : `bnpre/corr/CORR.md` l.91,
    `bnpre/g2/G2-RAPPORT.md` l.105, `bnpre/rr/G2-RAPPORT.rr.md` l.70 (O-1). Déclencheur : le prochain lot qui touche
    `scripts/record-binance-klines.mjs` ; prix : une ligne et un cas ; état : ouvert.
    **Clos le 2026-10-04** par le lot BINANCE-PRE35-1 (PR #115, fusion au tronc `c5c700b8`, oracle vert, 2 096 tests).
  - SERIES-TLS-RESUME-1 (nom proposé ; PAROXYSME, limite L-1 de BINANCE-PRE153-1) : la lignée d'une session TLS reprise est déduite de
    la politique du cache de sessions d'undici (source lue, mesurée), jamais montrée par la connexion. Construction qui donne la
    garantie : couper la reprise (`maxCachedSessions: 0`), ce qui exige un répartiteur propre, hors du `fetch` par défaut (paquet
    `undici` : R-8 ; ou `https.request` de node). Source : `bnpre/G1.md` l.118 (Q-BNPRE-5) et l.130. Déclencheur : avant la course des
    35 ; prix : environ 15 lignes et le test adapté ; état : ouvert.
    **Clos le 2026-10-04** par le lot BINANCE-PRE35-1 (PR #115, fusion au tronc `c5c700b8`, oracle vert, 2 096 tests).
  - SERIES-ENV-VALUES-1 (nom proposé ; PAROXYSME, limite L-2 de BINANCE-PRE153-1) : les valeurs des douze noms admis ne sont jamais
    lues ; un `SYSTEMROOT` ou un `WINDIR` qui pointe ailleurs passerait (des chemins de fournisseurs Winsock s'en déduisent sous
    Windows : non mesuré). Construction : une forme fermée des valeurs (`SYSTEMROOT` = `WINDIR`, chemins absolus ; `PATH` fait de
    chemins absolus), valeurs jamais imprimées. Source : `bnpre/G1.md` l.131. Déclencheur : avant la course des 35 ; prix : environ 6
    lignes et 2 cas ; état : ouvert.
    **Clos le 2026-10-04** par le lot BINANCE-PRE35-1 (PR #115, fusion au tronc `c5c700b8`, oracle vert, 2 096 tests).
  - SERIES-TLS-ISSUER-BY-NAME-1 (nom proposé ; mesure, O-1 du correcteur de BINANCE-PRE153-1) : dans un processus qui a confié deux AC
    de même nom sans identifiants de clé, `issuer_sha256` d'une feuille servie seule a nommé l'autre AC (mécanisme non lu : source C++
    de node absente de l'hôte ; effet sur une chaîne de production non mesuré). Construction : une sonde de bouclage (feuille et
    intermédiaire avec identifiants de clé, puis feuille seule, deux racines de même nom confiées) qui mesure l'émetteur journalisé.
    Source : `bnpre/corr/CORR.md` l.103. Déclencheur : avant la course des 35 ; prix : une sonde, aucune ligne du lot ; état : ouvert.
    **Clos le 2026-10-04** par le lot BINANCE-PRE35-1 (PR #115, fusion au tronc `c5c700b8`, oracle vert, 2 096 tests).
  - SERIES-ENV-PROVENANCE-1 (PAROXYSME ; F-5 de la G2 de MONARK sur #115) : la forme fermée de SERIES-ENV-VALUES-1 contrôle la forme
    des valeurs, pas leur provenance : `SYSTEMROOT` = `WINDIR` = tout dossier absolu passe. Construction à chercher : les lier au dossier
    Windows que rapporte le système, sans code natif. Propriétaire : RECHERCHES (recherche et mesure sur l hôte win32), report ici par
    MONARK ; source : `docs/G7-lot-binance-pre35-1.md` l.193-202. Déclencheur : le prochain lot qui touche la garde d environnement
    d un enregistreur, ou la première course sur un autre hôte que celui des 35. Prix : une sonde hors réseau sur win32, environ une
    demi-session ; si une source sans code natif tient, environ 4 lignes et 1 cas. État : ouvert.
  - Clos dans ces lots, preuves au recensement : COINBASE-WITNESS-ONLY-PAGE-1 (formé au G1, `cbedges/G1.md` l.333-337 ; clos par la
    règle de RECHERCHES, `record-coinbase-candles.mjs` l.293-294 et l.325, tests l.851 et l.863), SERIES-STATUS-FIRST-LOG-1 (nom proposé
    par la G2, G2-BNPRE-5 ; sans objet par la ligne d'arrivée, l.233-235, test l.1094) ; et à leur place : partie Binance de
    SERIES-ENV-ALLOWLIST-1, SERIES-BODY-BOUND-1, SERIES-ERROR-BODY-1 (partie Binance), partie Coinbase étendue de MAIN-GUARD-REALPATH-1,
    SERIES-TLS-PEER-LOG-1, COINBASE-PASS-SHARED-BOUND-1, COINBASE-MUTANTS-ADD7-1, REPLAY-INTERVAL-BIND-1 (Katas).
  - Existants mis à jour à leur place : VERIFY-TEST-DEAD-CHILD-2, COINBASE-BOUNDS-READ-1, COINBASE-TRUNCATION-RESIDUAL-1,
    COINBASE-HOLE-WINDOW-1, SERIES-PROXY-GUARD-1, BINANCE-REPLAY-NON200-ATTEST-1, BINANCE-OPENSSL-PREFIX-PIN-1, les actes en cours,
    COINBASE-PROBE-RUN-1, RED-PROOF-PIN-1. Questions ouvertes de ces lots : au recensement.
- **Chantier moteur (RECHERCHES)** : CM-1 (BYO-NEAR-NAME-1, S-11 ; ligne B-1 de `docs/adr/ADR-CM-chantier-moteur-audit-P3.md`) est
  fusionnée dans la branche de base `base/chantier-moteur-2026-10-03` (PR #103 `c53f0a72`, points de forme PR #104 `6da4504d`) et dans
  le tronc (`59b95f29`, `2cf89fce`). Ordre des déploiements retenu (`docs/G7-lot-cm-1.md` l.35), chaque acte sous le go de
  l'investisseur : (1) relecture d'hôte en lecture seule par MONARK ; (2) NARABI-L-1 seule, depuis sa fusion `5c5f636`, faite à
  22:09 UTC ; (3) l'arbre au sha `6da4504d`, **déployé le 2026-10-03 à 22:33:46 UTC** (go relayé par RECHERCHES, confirmé par
  l'investisseur ; journal de provenance, entrée de 22:35 UTC) : B-0 et B-1 servis, S-11 close au servi. Contrôle par diff de
  MONARK : C-1 à C-8 puis F-1 à
  F-5 pliés (PR #104), rien de bloquant au dernier tour (`F:/tmp/rech/cm1rev/RAPPORT.md`, `F:/tmp/rech/cm1rr/RAPPORT.md`). Items portés
  par RECHERCHES, au §10 et aux amendements datés de l'ADR-CM : BYO-ASCII-LOOKALIKE-1 (imitations ASCII qui passent B-1 ; déclencheur :
  plan de CM-2 ; prix : environ 40 lignes de code et 80 de tests, une ligne B neuve, go du fondateur) ; LIQ-BAND-EXACT-GUARD-1 (garde
  « max yhat de la strate + qhat au plus 2^53 » au chargement d'une calibration liq, avec son test, dans CM-4 ; déclencheur : avant toute
  strate liq nouvelle) ; au G0 de CM-1 seulement : BYO-HOMOGLYPH-1 (résidu non ASCII, appel direct seul, hors contrat ; sans
  déclencheur ni prix : Q-7 du recensement). Côté MONARK :
  MUTANTS-REPLAY-NONCONCLU-1 et HARNESS-BYO-400-RATE-1 (ci-dessus) ; le §10 porte aussi BTC-DIR-RETIRE-SURFACES-1 et W2E-TAIL-1
  (MONARK). CM-2a : PR #105 (`f3b330cf`), contrôle par diff de MONARK rendu le 2026-10-03 (23:4x UTC) : APPROUVE-AVEC-CORRECTIONS
  (`F:/tmp/rech/cm2arev/RAPPORT.md`, sha256 `ed09b168…`), rien de bloquant pour la fusion ; avant déploiement : C-1 (14 sites de
  refus sans code épinglé), C-2 (liste des formes de `produced_at` refusées incomplète), C-8 (côté MONARK : la CA ne voit pas
  CM-2a) ; aucun appelant connu touché par B-4. R-25 : décision de l investisseur (2026-10-03, 23:5x UTC, choix verbatim « Garder,
  547 dès CM-2c (Recommandé) ») : CM-2a (700) et CM-2b (702) gardent la borne de 1 150 de l ADR-CM validée ; 547 par lot dès CM-2c.
  **#105 fusionnée** dans la base (`98e3779a`, 2026-10-04 vers 00:00 UTC) et au tronc (`4a1b4844`). CM-2b : PR #106 (`2abe8013`),
  posée sur #105 ; CI `r25-taille-de-lot` rouge (702 lignes) ; ordre forcé : verdict et fusion de #105, contrôle par diff de #106
  par une instance neuve, puis les surfaces.
  CM-2c (#107) : Q-1 tranchée par l investisseur (2026-10-04, 03:3x UTC, choix verbatim « Go explicite aux quatre (Recommandé) ») :
  les précisions (1) à (4) de B-10 (`.` lu `-` ; `4` lu `a` sous `kata:` ; E16 ; repli i → l, faux refus `btc-dlr-1h` déclaré,
  BYO-LOOKALIKE-RESIDUAL-1) ont son go explicite (règle de l amendement « soir » de l ADR-CM, l.156).
  SPEC-PUBLISH-PIPELINE-1 (CR-8 ; écrit par RECHERCHES, G2 en trois tours ACCEPT) : **fusionné au tronc le 2026-10-04** (PR #117, fusion
  `96eab664`, oracle vert) : producteur déterministe de l arbre de `monark-kata-spec`, `--verify` égal à l octet sur `ddfee9e`
  (manifeste `720e99d4…`) ; l outil ne pousse ni ne publie jamais. Décisions de MONARK sur Q-SP-1 à Q-SP-6 : les propositions du
  G7 sont retenues ; pour Q-SP-1, les sources 1.1.0 neuves ne vont sous `spec/` de la gouvernance (publique) qu après le go F-5a.
  Items : SPEC-1-1-0-RELEASE (MONARK : la déclaration `contract-1.1.0` et I-2, sources épinglées ; déclencheur : la publication de
  la spécification 1.1.0) ; CANON-SINGLE-SOURCE-1 (RECHERCHES : l écriture canonique de l outil remplacée par la fonction unique de
  `packages/contracts` ; déclencheur : fusion de CM-3c-1) ; DURABLE-SCAN-TEMPLATE-1 (rpc-guard : le scan de `durable.test.ts` lit un
  gabarit après `from(` comme un spécifiant ; déclencheur : le prochain lot de rpc-guard) ; SPEC-CI-SOURCE-1 (Q-SP-6 : le workflow de
  CI du dépôt public produit depuis une source de gouvernance épinglée ; déclencheur : le premier workflow de ce dépôt) ; états : ouverts.
  Pile CM-2 au tronc (2026-10-04, 05:0x à 05:4x UTC) : #106, #110, #111 et #108 fusionnées sur la base du chantier moteur, puis au tronc
  une par une par leur commit de fusion (R-25 par fusion, porte verte à chaque fois ; une fusion de la base en un bloc rougissait R-25) :
  `ce4e5d2f` (#106) et `be3ce45b` (#110) : les 10 rouges de surface déclarés au G0 de CM-2b ; `9e0b611d` (#111) et `8aae90af` (#108) :
  seuls les 2 rouges du temps (ii), `harness_served_data_matches_in_process_harness` et `narabi_gate_facts_read_from_committed_sources`,
  acceptés par l amendement « nuit, 3 » jusqu au déploiement de l étape 4 et à la resynchronisation. Restent #109 (étape 5) et #107 (étape 6).
  #109 (`92bdec97`) et #107 (`aaf5d039`) suivent au tronc. **Étape 4 déployée le 2026-10-04 à 07:44:08 UTC** (arbre `94974ddf`, go
  « vous avez tous mes GO ») : sonde 84/84, CA 15 contrôles ; temps (ii) commis (`8082f223`), oracle du tronc à 0 échec : les 2 rouges
  sont fermés. Restent hors de ce go : l envoi du site (les surfaces de #111) et la synchro du miroir public, à l investisseur.
  - BTC-DIR-RETIRE-SURFACES-1 (MONARK ; déclencheur « PR CM-2b » atteint le 2026-10-03) : liste du G0 de CM-2b (§ du même nom).
    Décision de l investisseur (2026-10-03, 22:4x UTC, choix verbatim « Built, preuve attest servi (Recommandé) ») : Shōgen garde
    `built` ; `integration_test` de `apps/site/lib/fleet.ts` pointe vers un test d intégration non-LLM de l outil `attest` servi, plus
    `gate_attested_is_frozen_attested_price` et `gate_attested_discordant_is_tool_error` ; la note dit la jointure dormante ; ligne
    datée à ADR-0028 §4.11 de Shōgen (`d383a51`). Décision de l orchestrateur : étape 7 de la trace h5 gardée, ré-épinglée sur le
    refus `task_class_retired`, avec une note de provenance. Deux temps, car `scripts/sync-harness-served.mjs` ne lit que le service
    en ligne : (i) avec #106, ce qui est vert à l arbre fusionné et contre le service d aujourd hui ; (ii) après le déploiement de cet
    arbre (go séparé), `apps/site/data/harness-served.json` régénéré, la CA, et les tests qui lisent ces données, rouges entre les
    deux par construction. Le temps (i) porte aussi C-8 du contrôle de CM-2a : deux contrôles de plus à `scripts/verify-harness.mjs`
    (un 400 avec son code ; un `produced_at` en 2099 rendu 400 `produced_at_future`). État : contrôle par diff de #106 en cours.
  - CONTRACT-1-1-0 (CM-3c, ligne B-11 de l ADR-CM ; part de MONARK : spécification publique, miroir, site, avis aux appelants,
    déploiement). Décisions de l investisseur (2026-10-03, 23:4x à 23:5x UTC) : calendrier « Avec CM-4 (Recommandé) » ; portée,
    verbatim : « nous somme en train de mettre a jour le moteur MONARK, autant que le nouveau soit prét pour tout le reste du pla et
    ne pas refaire aprés, en ce moment personne n utilise monark engine; donc on doit faire come si on le concevait pour la
    premiére fois, un gros upgrade ». Lecture transmise à RECHERCHES : une seule version 1.1.0 pour prédiction, verdict et décision
    (`apps/harness/src/tools/gate.ts:62` les lie), aucune acceptation du 1.0.0. Recensement de la zone MONARK :
    `F:/tmp/rech/v110/RECENSEMENT-1-1-0.md` (27 sites, 29 empreintes sûres, 10 conditionnelles ; aucune liste d appelants ; rien ne
    produit encore `KraidleAI/monark-kata-spec`). Déclencheur : le plan de CM-3c ; état : ouvert.
    Liste de T0 de MONARK (relevée le 2026-10-05) : les deux schémas neufs sur le site, avec la republication de la spécification ;
    les textes publics hors pages (Q-M16 du G0 du bloc C : `skills/monark/SKILL.md`, `DEMO.md`, `INTEGRATION.md`, `README.md:328`,
    `docs/RUNBOOK-harness.md:169`, `apps/site/lib/sim.ts:25`, `docs/deploy-CA-harness.json`) ; « calibration digest » et
    `DIGEST_NOTE` ; `/integrators` et `/docs/integrators` (`calib_digest`, `set_digest`) ; le `$comment` de `ukemi-pending.json`
    (porte de vocabulaire) ; la page Narabi et son chargeur (Q-M6) ; l ordre CA, sync du harnais, puis sync ukemi (RUNBOOK-vitrine).
    Ajouts : « Eight frozen contracts » (`apps/site/app/page.tsx:181`, `docs/page.tsx:61`) ; `apps/harness/README.md` et
    `fixtures/PROVENANCE-*.md` (coupe de C2, Q-3a-5) ; `main` du dépôt de gouvernance avancée jusqu au tronc (avance rapide).
  - DEMO-HASH-STALE-1 : `skills/monark/DEMO.md:88` cite l empreinte tronquée `79b54471…` de la trace byo, périmée (actuelle
    `daf8d3ea…`), sans test. Construction : la corriger et l épingler par un test ; environ 3 lignes. Déclencheur : le lot des
    surfaces de CM-2b (temps (i)) ; état : ouvert.
  - RED-PROOF-JUNCTION-1 (outil ; C-4 du contrôle de CM-2a, mesuré le 2026-10-03) : `scripts/red-proof.mjs` (`linkModules`,
    l.135-149) ne lie une jonction de `node_modules` que si c est un espace de travail ; sur un clone dont chaque entrée est une
    jonction (`mk-nm.ps1`), un test qui importe un paquet hors espace de travail rend `ERR_MODULE_NOT_FOUND` et la preuve REFUSED.
    Contournement mesuré : `--repo F:/Monark`. Construction : lier la cible réelle d une jonction hors espace de travail, et un cas
    au test de l outil ; environ 10 lignes. Déclencheur : le prochain lot de l outil (avec MUTANTS-TEST-SUPPORT-1) ; état : ouvert.
  - DOJO-E2E-DISK-1 (G2 delta de T0-FOLLOWUP-1 et d ANCHORS-DRIFT-1, §3, 2026-10-06) : `dojo_history_collect_to_verify_end_to_end`
    (`test/dojo-history-e2e.test.ts`) rougit sur un hôte dont le tmpdir a moins d environ 1,27 Go libres. Le collecteur refuse
    `disk_space` (`apps/dojo/src/history-collect.ts:184-185`, plancher D-10, lu par `statfs`), et il a raison : le test n était pas
    hermétique. Dette de test, non de produit. Porteur : RECHERCHES.
    Ligne datée 2026-10-06 (RECHERCHES, lot DOJO-E2E-DISK-1) : clos. Le test remplace `statfsSync` le temps du test, au plancher exact
    de D-10 recodé, et rétablit la fonction en fin de test. Un octet de moins est refusé `disk_space`, sans rien écrire. Le produit ne
    change pas, et son refus reste épinglé seul par `dojo_history_disk_rpc_error_and_faulted_body_paths`. Preuve : sous un hôte simulé
    à 946 Mo libres, le test est rouge à la base (`disk_space`) et vert après le lot.

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
  intervalle ; élargi le 2026-10-03 par RECORDER-CLOSE-TIME-1, son I-1 ; faits : manifeste comparé, clôture hors créneau, pages
  attestées, lecture fermée de Q-CORR2-1 ; restaient (a) l'intervalle nommé par `requests.jsonl`, (b) une source `raw/` seule et (d) une
  ancre externe ; source : `F:/tmp/rech/ct/corr2/CORR2.md` l.100, `ct/corr3/CORR3.md` l.78 ; déclencheur : avant le scellement des 118.
  **Clos le 2026-10-04** par BINANCE-PRE153-1 (fusion `328be484`) : (a) chaque requête de `requests.jsonl` nomme `--interval`, sinon
  `interval_mismatch` (l.182-186) ; (b) une source sans manifeste ni journal, ou sans journal ni `SHA256SUMS`, est refusée avant
  lecture, `source_unattested` (l.176 ; G2-BNPRE-1) ; (d) le manifeste d'un rejeu porte le sha256 du journal et du `SHA256SUMS` lus
  (l.189, l.347) ; tests l.377, l.636, l.729, l.999 et l.1062 ; le scellement des 118 en forme B reste un acte (`ct/corr3/CORR3.md`
  l.78) ; acte de fusion lié, fait le 2026-10-03 : la ligne datée H-6 de `docs/marche/FAITS-binance-klines-2026-10-01.md` dit la garde
  `close_time` retirée et nomme `close_out_of_slot`).
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
  ENGINE-ROW-RETIRE-PATH-1 au 2026-10-06 (RECHERCHES, lot T0-FOLLOWUP-1) : G0 en brouillon remis à MONARK le 2026-10-06 (pièce
  recherches `coordination/pieces/2026-10-06-G0-retire-path/`), à coder avant E-1, en parallèle de FORMAT-W2 ; repli accordé par MONARK
  (`034a528`) : si sa partie harnais n est pas fusionnée quand part le G0 court de E-1a, E-1 passe d abord, et le retrait s écrit après
  E-1b, sur la fonction à deux registres ;
  ENGINE-ROW-RETIRE-PATH-1, R-a fusionnée le 2026-10-06 (#209, fusion `f2152918`, oracle G7 `ad0e1bf9…`,
  `docs/G7-lot-retire-path-ra.md`) : liste de retrait datée, chaîne lue par la garde, recouvrement de la projection, borne `LIVE_N_MAX` ;
  non servie avant le chargeur d E-2a (RETIRE-LISTS-E2A-PIPE-1). Restent R-b (publication datée), puis la répétition chronométrée
  (D6 : « livré et mesuré ») ;
  ENGINE-ROW-RETIRE-PATH-1, R-b fusionnée le 2026-10-06 (#211, fusion `5348b9d2`, oracle G7 `b569bd5c…`, `docs/G7-lot-retire-path-rb.md`) :
  versions datées des tables (`spec/contract-1.1.0-tables-<date>/`), dossier daté jamais réécrit, ligne retirée publiée avec la liste de
  son dossier. D6 reste ouvert jusqu aux deux mesures de latence au JOURNAL (RETIRE-LATENCY-REHEARSAL-1) ;
  VERIFIERS-LIST-F5A-1, partie 1, lot 1a fusionné le 2026-10-06 (#210, fusion `0c2e487d`) : trois fichiers de l outil de recalcul à
  l octet, test d arbre épinglé ; lots 1b et 1c prêts (`9033650d`, `63367732`), 1d en construction ; G7 à la fin de la partie 1 ;
  SERIES-FULL-HISTORY-1 FAIT le 2026-10-02 (19:19 UTC) : 914 courses, 762 dossiers scellés sous `F:/PRODUITS/marche/history/` (symbole × mois ×
  intervalle), empreintes postées (recherches, pièces `2026-10-02-series-full-history`), rien transféré ; 153 arrêts `close_time` (bougies
  tronquées 2017-2021, et la panne du 2023-03-24 12:39Z sur les 15m et 1h de 2023-03, WARM-2) ; blocs 2022-09 → 2024-09 : 292/300, 0 manquante.
  Item RECORDER-CLOSE-TIME-1 (successeur de l enregistreur : garde et liste les clôtures irrégulières, ne s arrête que sur la grille ; rejeu
  EE-3 au bit sur un mois scellé ; ré-enregistrement des 153 mois) : GO de l investisseur le 2026-10-02 à 19:21 UTC (verbatim : « go pour
  l enregistreur successeur, demain après la publication ») ; déclencheur : après la première publication du Dōjō, avant P0-2. W2-S-SIM-1.
  RECORDER-CLOSE-TIME-1 au 2026-10-03 : successeur fusionné (`a05fbbe9`, fusion `f7a55512`), rejeu égal à l'octet sur les 12 scellés de
  2024-09 ; reste le ré-enregistrement des 153 (scellement des 118, course des 35 : actes en cours) ; ses items sont dans « Points connus ».
  Addendum 1 de l ADR 0006 (règles 1 à 8) relu CONFORME le 2026-10-02 19:34 UTC (PR recherches#57) ; règle 8 précisée sur les octets du
  2023-03-24 (reprise 14:00Z, 0 trade 11:30 à 12:29) ; 8 bis `zero_trade` et instance de lieu attendus de RECHERCHES ; manifeste du successeur
  à porter `zero_trade`. Les tables de puissance peuvent être calculées sur les règles 1 à 7.
  Chantier L2 (go investisseur 2026-10-03 00:2x UTC, « maintenant ») : RECORDER-L2-1 (carnet spot ±100 pb, meilleur prix, transactions,
  différences BTC/ETH si tenable), RECORDER-LIQ-1, RECORDER-OI-1 (5 min), RECORDER-EXCHINFO-1 (quotidien), RECORDER-L2-REGION-2 (second
  hôte, autre région, identité à l octet) ; différés RECORDER-FUNDING-1, oracle, diffs BNB/SOL. Préalables : FAITS-L2-ACCESS-1 (conditions,
  région de l hôte, points d accès, Q-6 à Q-10) avant tout appel ; hôte = serveur du site sous quota ; audit advisor marché (0007-AVIS) plié.
- **ADR de la vague 2 ACCEPTÉ par le fondateur** (v8.1, 2026-10-02 ; empreinte du texte accepté `fe48c03a33da7ab0090b97a41b911f74102de61fa6059188e1c01d23a8fb4be6`,
  relevée sur place à 19:13 UTC, pour P0-2 ; checkpoint-1 MONARK ACCEPTE-AVEC-CORRECTIONS plié). Parties : A W2-E + W2-S (MONARK après le
  chantier 2), B W2-H + W2-L, acte P0-2, C W2-C + W2-F, D course 2b. C-3 (diff A-1) fait le 2026-10-04 :
  CONFORME, ligne P0 d A-1 `3283e9ce` ; dû par MONARK : C-6 (FAITS) avant P0-2.
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
