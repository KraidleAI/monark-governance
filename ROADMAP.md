# ROADMAP — le moteur MONARK (HIKAE + Genkan)

Mis à jour le 2026-11-04. Une ligne qui change remplace l'ancienne ; l'historique est dans git, pas ici.

## Où on en est (vérifié sur le code le 2026-11-04)

- **Tests** : `npm run ci` est vert sur une installation fraîche (vocabulaire, typecheck strict, 582 tests sur 582, hors
  noyau Lean) ; `npm run test:genkan` aussi, noyau compris (37 tests sur 37, dont l'outil `judge` sur le noyau construit).
  `npm run lint` et `npm run lint:ratchet` sont verts ; le plafond de dette de typage des tests est à 45.
- **HIKAE** (`packages/hikae`) : les trois couches sont là. L1 fait le split conforme par classe, L2 le moniteur et le
  budget `B_t`, L3 la politique qui rend une `GateDecision`. Le suivi en ligne aussi : une bibliothèque de paris en
  rationnels exacts, un détecteur de changement à redémarrage pondéré, une politique par cellule, le moniteur M1, une garde
  de pas, et le test de la durée moyenne avant fausse alarme (PR #344, #348, #349, #352, #353). Depuis l'étape 6,
  `suiviReplay` rejoue les preuves d'une cellule en un budget, que le gate lit.
- **Harness** (`apps/harness`) : un serveur MCP à trois outils, `gate`, `calibrate` et `judge` (Genkan) ; `attest` et
  `cascade` sont archivés depuis l'étape 7. Depuis l'étape 6, `gate` rejoue le suivi de la cellule quand l'appelant le
  porte (`params.suivi`) et ne peut qu'en baisser `B_t`. Les classes du gate viennent toutes de l'ancien périmètre et restent servies
  jusqu'à l'étape 3 : USDe stable-run, liquidations UKEMI, la classe cascade (sans calibration : elle s'abstient) et
  32 classes kata (BTC, ETH, BNB, SOL). La stratégie du fondateur n'y est pas encore.
- **Genkan** (`apps/genkan`) : un noyau Lean 4.32.1 à trois modes. Le mode 1 juge un ordre sous un contexte (l'action de
  HIKAE, les places et les actifs autorisés, leurs plafonds) et rend `allow` ou `deny <raison>` ; le mode 2 décode un ordre
  `GNK1` ; le mode 3 calcule un SHA-256 ; toute autre requête est refusée (code de sortie 3). 30 théorèmes prouvent les
  règles du juge et la réponse du noyau : quelle que soit l'entrée, `allow` ne sort que d'un verdict allow du juge. La CI
  rejoue chaque module par `leanchecker` et audite l'enregistrement d'axiomes de `main` et de chaque théorème ; les mutants
  du décodeur sont tués. Le harness le lance : l'outil `judge` (étape 5) passe l'ordre au noyau construit, sous l'action de
  la `GateDecision` qu'il calcule lui-même sur le même appel (sous abstain pour une EXIT dont le gate refuse l'enveloppe),
  et lit sa réponse sans rien supposer (`readVerdict`).
- **PR** : #355 (l'étape 5) et #356 (l'étape 7) fusionnées dans `lot/etude-suite` le 2026-11-04 ; #345 et #323 fermées le
  même jour, sur décision du fondateur. L'étape 6 est sur la branche `lot/etape-6-suivi`, partie de `c331e276` (la tête de
  l'étape 7), avec sa PR vers `lot/etude-suite`.

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
| 8 | Le bout en bout sur papier | un signal passe HIKAE, puis Genkan, et sort en ordre simulé, une EXIT en reduce-only (`reduce_only` de `judge`) ; le journal se rejoue |
| 9 | Le premier ordre réel | sur go du fondateur, ordre par ordre |

## Choix en vigueur

| Sujet | Choix |
|---|---|
| Périmètre | HIKAE, le harness et Genkan ; le reste est à l'archive `F:\ARCHIVE-MONARK-2026-11-04\` |
| Langages | TypeScript strict sur Node 24 (`node:test`) ; Lean 4.32.1 pour le noyau de Genkan |
| Contrats | les schémas de `schemas/` font foi ; `packages/contracts` en est la liaison TypeScript |
| Garantie de HIKAE | couverture marginale, en échantillon fini, sous échangeabilité dans la classe ; jamais une probabilité d'avoir raison |
| Dépôt | `KraidleAI/monark-governance`, public ; branche de travail `lot/etude-suite` ; rien n'est poussé sans accord |
| CI | quatre tâches : tests, lint, audit des dépendances, noyau Lean (avec l'outil `judge` du harness sur le noyau construit) ; elles tournent sur une PR, pas sur un push (`on: pull_request`) |
| Ordres et argent | aucun ordre réel, dépôt, retrait ou transfert sans go du fondateur, ordre par ordre |
| Le noyau dans le harness | `judge` passe d'abord par le gate : une enveloppe qu'il refuse est une erreur d'outil pour tout ordre sauf une EXIT. Une EXIT est jugée quand même, sous l'action abstain, sans décision du gate (`decision` à `null`, le refus dans `gate_error`) : décision du fondateur du 2026-11-04, un signal que le gate refuse ne bloque pas une sortie. Une enveloppe mal formée (refusée par le schéma d'entrée) reste refusée, EXIT comprise. Le noyau est lancé en synchrone (`spawnSync`) : chaque appel tient le serveur le temps du noyau (environ 30 ms mesurés sous Windows, au plus 10 s). Un lancement asynchrone, limité à quelques noyaux à la fois, est exigé avant tout déploiement derrière `api.` ou `mcp.monarkgate.tech` (décision du fondateur du 2026-11-04) ; ce sera un lot à part, avec sa revue |
| Le suivi dans le gate | l'appelant porte les preuves de la cellule (`params.suivi`) ; le serveur les rejoue à chaque appel et ne garde rien. Un segment sans licence ou fermé rend `B_t` à -1, donc abstain `budget_exhausted` : une raison à part changerait le contrat gelé `GateDecision`, c'est au fondateur d'en décider. Aucune signature n'est encore lue (le `keyring` n'est contrôlé que dans sa forme) ; les politiques par cellule seront committées avec la calibration des classes de la stratégie (étape 3). Le rejeu ne réduit plus ses fractions : il compare leurs entiers au seuil et prend le plancher du budget sur eux (`capitalCrosses` et `capitalBudget` de la bibliothèque de paris), si bien que n étiquettes coûtent environ n produits de n·L bits par pari, sans pgcd, L étant la taille en bits du dénominateur commun des facteurs de paris de K et W (7 pour la cellule USDe). Bornes : 500 évaluations et 500 issues, 8 paris par mélange, 20 caractères par texte rationnel, et n·L au plus 3600 bits, vérifiés avant le rejeu. Mesures du 2026-11-04, entre parenthèses le temps quand chaque étiquette réduisait ses fractions : à 500 étiquettes, la cellule USDe 0,12 s (0,55 s) et 8 paris par mélange à L = 7, poids et détecteur à neuf chiffres, 0,3 s (0,73 s) ; sans la borne de travail, L = 82 à 200 étiquettes 0,16 s (8,1 s) et des rationnels à neuf chiffres à 500 étiquettes 0,84 s (77,5 s) ; des textes de milliers de chiffres coûteraient encore bien plus. La borne de travail reste à 3600 bits, par décision du fondateur du 2026-11-04 : aucune politique n'en demande plus aujourd'hui (la cellule USDe prend 3500 bits à 500 étiquettes), et elle sera revue à l'étape 3, avec les politiques de sa stratégie. Mesuré le même jour à 500 étiquettes, avec 8 paris partout et des poids à neuf chiffres : 0,58 s à n·L = 20 000 bits et 0,81 s à 30 000 |
| Règles du juge | TRANSFER et APPROVE toujours refusés ; la cible doit être une place listée ; une EXIT y passe quelle que soit l'action de HIKAE, sans plafond (confirmé par le fondateur le 2026-11-04 ; l'exécuteur la passe en reduce-only) ; tout autre ordre exige COMMIT, un actif listé et un montant au plus égal à son plafond (un plafond vaut par ordre, pas en cumul) ; un SWAP, un actif de sortie listé et un `minOut` non nul |
