# ROADMAP — le moteur MONARK (HIKAE + Genkan)

Mis à jour le 2026-11-04. Une ligne qui change remplace l'ancienne ; l'historique est dans git, pas ici.

## Où on en est (vérifié sur le code le 2026-11-04)

- **Tests** : `npm run ci` est vert (vocabulaire, typecheck strict, 590 tests sur 590, hors noyau Lean) ;
  `npm run test:genkan` aussi, noyau compris (39 tests sur 39, dont l'outil `judge` et l'exécuteur papier sur le noyau construit).
  `npm run lint` et `npm run lint:ratchet` sont verts ; le plafond de dette de typage des tests est à 45.
- **HIKAE** (`packages/hikae`) : les trois couches sont là. L1 fait le split conforme par classe, L2 le moniteur et le
  budget `B_t`, L3 la politique qui rend une `GateDecision`. Le suivi en ligne aussi : une bibliothèque de paris en
  rationnels exacts, un détecteur de changement à redémarrage pondéré, une politique par cellule, le moniteur M1, une garde
  de pas, et le test de la durée moyenne avant fausse alarme (PR #344, #348, #349, #352, #353). Depuis l'étape 6,
  `suiviReplay` rejoue les preuves d'une cellule en un budget, que le gate lit.
- **Harness** (`apps/harness`) : un serveur MCP à trois outils, `gate`, `calibrate` et `judge` (Genkan) ; `attest` et
  `cascade` sont archivés depuis l'étape 7. Depuis l'étape 6, `gate` rejoue le suivi de la cellule quand l'appelant le
  porte (`params.suivi`) et ne peut qu'en baisser `B_t`. Depuis l'étape 8, un exécuteur papier (`src/paper.ts`, non servi)
  mène un signal jusqu'à l'ordre simulé, en tient l'état et le journal, et rejoue ce journal. Les classes du gate viennent
  toutes de l'ancien périmètre et restent servies jusqu'à l'étape 3 : USDe stable-run, liquidations UKEMI, la classe cascade
  (sans calibration : elle s'abstient) et 32 classes kata (BTC, ETH, BNB, SOL). La stratégie du fondateur n'y est pas encore.
- **Genkan** (`apps/genkan`) : un noyau Lean 4.32.1 à trois modes. Le mode 1 juge un ordre sous un contexte (l'action de
  HIKAE, les places et les actifs autorisés, leurs plafonds) et rend `allow` ou `deny <raison>` ; le mode 2 décode un ordre
  `GNK1` ; le mode 3 calcule un SHA-256 ; toute autre requête est refusée (code de sortie 3). 30 théorèmes prouvent les
  règles du juge et la réponse du noyau : quelle que soit l'entrée, `allow` ne sort que d'un verdict allow du juge. La CI
  rejoue chaque module par `leanchecker` et audite l'enregistrement d'axiomes de `main` et de chaque théorème ; les mutants
  du décodeur sont tués. Le harness le lance : l'outil `judge` (étape 5) passe l'ordre au noyau construit, sous l'action de
  la `GateDecision` qu'il calcule lui-même sur le même appel (sous abstain pour une EXIT dont le gate refuse l'enveloppe),
  et lit sa réponse sans rien supposer (`readVerdict`).
- **PR** : #355 (l'étape 5), #356 (l'étape 7) et #357 (l'étape 6) fusionnées dans `lot/etude-suite` le 2026-11-04 ; #345
  et #323 fermées le même jour, sur décision du fondateur. L'étape 8 est sur la branche `lot/etape-8-papier`, partie de
  `412339a0` (la tête de l'étape 6, que la fusion `0fbe4ea7` contient), ni poussée ni proposée en PR sans l'accord du fondateur.

## Les étapes

| # | Étape | Finie quand |
|---|---|---|
| 1 | Le recentrage : archive, cinq documents, CI réduite | faite le 2026-11-04 ; reste à réécrire les README de `packages/hikae` et `apps/harness`, qui citent encore des ADR archivés |
| 2 | La stratégie du fondateur, écrite dans `STRATEGIE.md` | ses signaux, ses marchés, ses horizons et ses règles de sortie sont écrits |
| 3 | L'adaptateur stratégie → `Prediction`, puis la calibration de ses classes | `gate` rend COMMIT, DEFER ou ABSTAIN sur un signal réel de la stratégie, avec son test |
| 4 | Le juge de Genkan en Lean, avec ses théorèmes | fait le 2026-11-04 (mode 1, 30 théorèmes rejoués en CI) ; la règle de l'EXIT confirmée par le fondateur le même jour |
| 5 | Le harness relié au juge | fait le 2026-11-04 : l'outil `judge` lance le binaire du noyau sur un ordre et le contexte tiré de la `GateDecision`, lit son verdict par `readVerdict` ; test d'intégration `apps/harness/test/judge.kernel.test.ts`, dans `test:genkan` et la tâche Lean de la CI |
| 6 | Le suivi en ligne de HIKAE branché dans `gate` | fait le 2026-11-04 : `gate` lit `params.suivi` (la politique de la cellule, ses évaluations de référence, leurs issues arrivées, l'état de départ du segment), le rejoue par `suiviReplay` (`packages/hikae/src/suivi`, sur `pari`) et prend `B_t = min(remainingBudget, budget rejoué)` ; le suivi ne peut que baisser le budget, donc pousser la décision vers abstain. Tests : `packages/hikae/test/suivi-replay.test.ts`, `apps/harness/test/gate-suivi.test.ts`, et de bout en bout sur MCP et le miroir HTTP `test/gate-suivi-served.test.ts` |
| 7 | Le harness réduit à HIKAE et Genkan | fait le 2026-11-04 : `attest`, `cascade` et leurs tests retirés du harness ; `packages/monark`, `packages/ukemi`, l'enregistreur de la calibration USDe et les fixtures Shōgen `s3-binance` archivés (`F:\ARCHIVE-MONARK-2026-11-04\MANIFESTE.md`) ; la trace H5 rejoue `gate`, `calibrate` et le miroir HTTP |
| 8 | Le bout en bout sur papier | fait le 2026-11-04 : l'exécuteur papier `apps/harness/src/paper.ts` (non servi) passe chaque signal par `judge` tel que le sert le miroir HTTP (le gate de HIKAE, puis le noyau construit) et remplit l'ordre sur papier ; il donne au noyau, comme plafond de chaque actif, le reste d'un total, si bien que le plafond tient en cumul, noyau inchangé ; une EXIT, marquée `reduce_only` par `judge`, ne remplit jamais plus que la position ouverte ; chaque étape va dans un journal déterministe (l'instant vient de l'appelant, aucune horloge n'est lue), que `replayPaperJournal` rejoue sur le noyau en refusant la première ligne qui diffère. Tests : `apps/harness/test/paper.test.ts` (faux noyau, dans `npm test`) et de bout en bout `apps/harness/test/paper.kernel.test.ts` (le noyau construit, dans `test:genkan` et la tâche Lean de la CI) : 14 étapes sur la clé USDe, puis 8 altérations du journal, chacune refusée à sa ligne |
| 9 | Le premier ordre réel | sur go du fondateur, ordre par ordre |

## Choix en vigueur

| Sujet | Choix |
|---|---|
| Périmètre | HIKAE, le harness et Genkan ; le reste est à l'archive `F:\ARCHIVE-MONARK-2026-11-04\` |
| Langages | TypeScript strict sur Node 24 (`node:test`) ; Lean 4.32.1 pour le noyau de Genkan |
| Contrats | les schémas de `schemas/` font foi ; `packages/contracts` en est la liaison TypeScript |
| Garantie de HIKAE | couverture marginale, en échantillon fini, sous échangeabilité dans la classe ; jamais une probabilité d'avoir raison |
| Dépôt | `KraidleAI/monark-governance`, public ; branche de travail `lot/etude-suite` ; rien n'est poussé sans accord |
| CI | quatre tâches : tests, lint, audit des dépendances, noyau Lean (avec l'outil `judge` et l'exécuteur papier du harness sur le noyau construit) ; elles tournent sur une PR, pas sur un push (`on: pull_request`) |
| Ordres et argent | aucun ordre réel, dépôt, retrait ou transfert sans go du fondateur, ordre par ordre |
| Le noyau dans le harness | `judge` passe d'abord par le gate : une enveloppe qu'il refuse est une erreur d'outil pour tout ordre sauf une EXIT. Une EXIT est jugée quand même, sous l'action abstain, sans décision du gate (`decision` à `null`, le refus dans `gate_error`) : décision du fondateur du 2026-11-04, un signal que le gate refuse ne bloque pas une sortie. Une enveloppe mal formée (refusée par le schéma d'entrée) reste refusée, EXIT comprise. Le noyau est lancé en synchrone (`spawnSync`) : chaque appel tient le serveur le temps du noyau (environ 30 ms mesurés sous Windows, au plus 10 s). Un lancement asynchrone, limité à quelques noyaux à la fois, est exigé avant tout déploiement derrière `api.` ou `mcp.monarkgate.tech` (décision du fondateur du 2026-11-04) ; ce sera un lot à part, avec sa revue |
| Le suivi dans le gate | l'appelant porte les preuves de la cellule (`params.suivi`) ; le serveur les rejoue à chaque appel et ne garde rien. Un segment sans licence ou fermé rend `B_t` à -1, donc abstain `budget_exhausted` : une raison à part changerait le contrat gelé `GateDecision`, c'est au fondateur d'en décider. Aucune signature n'est encore lue (le `keyring` n'est contrôlé que dans sa forme) ; les politiques par cellule seront committées avec la calibration des classes de la stratégie (étape 3). Le rejeu réduit des fractions exactes à chaque étiquette : n étiquettes coûtent environ n·(n·L)², L étant la taille en bits du dénominateur commun des facteurs de paris de K et W (7 pour la cellule USDe). Bornes : 500 évaluations et 500 issues, 8 paris par mélange, 20 caractères par texte rationnel, et n·L au plus 3600 bits, vérifiés avant le rejeu (le pire cas sous ces bornes est la cellule USDe elle-même, L = 7 à 500 étiquettes : 0,7 s mesurées le 2026-11-04, plus 0,2 s au plus pour un détecteur à 8 paris ; sans ces bornes, un seul appel a tenu 75 s avec des rationnels à neuf chiffres, et des textes de milliers de chiffres coûteraient bien plus). Comparer un capital à son seuil sans le réduire couperait ce coût d'un facteur dix ou plus : un lot à part, dans la bibliothèque de paris |
| Règles du juge | TRANSFER et APPROVE toujours refusés ; la cible doit être une place listée ; une EXIT y passe quelle que soit l'action de HIKAE, sans plafond (confirmé par le fondateur le 2026-11-04 ; l'exécuteur la passe en reduce-only) ; tout autre ordre exige COMMIT, un actif listé et un montant au plus égal à son plafond (un plafond vaut par ordre ; l'exécuteur papier tient le cumul en donnant au noyau, comme plafond, le reste du total) ; un SWAP, un actif de sortie listé et un `minOut` non nul |
| L'exécuteur papier | en mémoire et non servi : il n'ouvre ni socket ni fichier, ne lit aucune horloge (l'instant vient de l'appelant) et ne place aucun ordre ; le journal est un texte que garde l'appelant. Le montant engagé est brut : une EXIT ne le libère pas, et le total borne tout ce qui a été ouvert depuis le début du journal (confirmé par le fondateur le 2026-11-04, tant que sa stratégie n'est pas écrite). Toute étape journalisée prend son id, refusée ou non : un id, une décision. Seuls OPEN et EXIT sont remplis, sans prix ; un SWAP est refusé `kind_not_paper`. Le rejeu tient chaque ligne au moteur et à la ligne d'avant, pas à une fin : un journal coupé net ou réécrit en entier rejoue, seule sa tête gardée à part le trahit (la signer serait un lot à part). Le total des tests (1000) est une valeur d'essai : les montants réels sont au fondateur |
