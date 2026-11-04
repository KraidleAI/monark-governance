# ROADMAP — le moteur MONARK (HIKAE + Genkan)

Mis à jour le 2026-11-04. Une ligne qui change remplace l'ancienne ; l'historique est dans git, pas ici.

## Où on en est (vérifié sur le code le 2026-11-04)

- **Tests** : `npm run ci` est vert (vocabulaire, typecheck strict, 608 tests sur 608, hors noyau Lean) ; `npm run
  test:genkan` aussi, noyau compris (37 tests sur 37, dont l'outil `judge` sur le noyau construit). `npm run lint` et `npm run lint:ratchet` sont verts ; le plafond de
  dette de typage des tests est à 60.
- **HIKAE** (`packages/hikae`) : les trois couches sont là. L1 fait le split conforme par classe, L2 le moniteur et le
  budget `B_t`, L3 la politique qui rend une `GateDecision`. Le suivi en ligne aussi : une bibliothèque de paris en
  rationnels exacts, un détecteur de changement à redémarrage pondéré, une politique par cellule, le moniteur M1, une garde
  de pas, et le test de la durée moyenne avant fausse alarme (PR #344, #348, #349, #352, #353).
- **Harness** (`apps/harness`) : un serveur MCP à cinq outils, `gate`, `calibrate`, `judge` (Genkan), `attest` (Shōgen)
  et `cascade` (UKEMI). Ses classes viennent toutes de l'ancien périmètre : USDe stable-run, liquidations UKEMI, et 32 classes
  kata (BTC, ETH, BNB, SOL). La stratégie du fondateur n'y est pas encore.
- **Genkan** (`apps/genkan`) : un noyau Lean 4.32.1 à trois modes. Le mode 1 juge un ordre sous un contexte (l'action de
  HIKAE, les places et les actifs autorisés, leurs plafonds) et rend `allow` ou `deny <raison>` ; le mode 2 décode un ordre
  `GNK1` ; le mode 3 calcule un SHA-256 ; toute autre requête est refusée (code de sortie 3). 30 théorèmes prouvent les
  règles du juge et la réponse du noyau : quelle que soit l'entrée, `allow` ne sort que d'un verdict allow du juge. La CI
  rejoue chaque module par `leanchecker` et audite l'enregistrement d'axiomes de `main` et de chaque théorème ; les mutants
  du décodeur sont tués. Le harness le lance : l'outil `judge` (étape 5) passe l'ordre au noyau construit, sous l'action de
  la `GateDecision` qu'il calcule lui-même sur le même appel, et lit sa réponse sans rien supposer (`readVerdict`).
- **Aucune PR ouverte** (#345 et #323 fermées le 2026-11-04, sur décision du fondateur).

## Les étapes

| # | Étape | Finie quand |
|---|---|---|
| 1 | Le recentrage : archive, cinq documents, CI réduite | faite le 2026-11-04 ; reste à réécrire les README de `packages/hikae`, `packages/ukemi` et `apps/harness`, qui citent encore des ADR archivés |
| 2 | La stratégie du fondateur, écrite dans `STRATEGIE.md` | ses signaux, ses marchés, ses horizons et ses règles de sortie sont écrits |
| 3 | L'adaptateur stratégie → `Prediction`, puis la calibration de ses classes | `gate` rend COMMIT, DEFER ou ABSTAIN sur un signal réel de la stratégie, avec son test |
| 4 | Le juge de Genkan en Lean, avec ses théorèmes | fait le 2026-11-04 (mode 1, 30 théorèmes rejoués en CI) ; la règle de l'EXIT confirmée par le fondateur le même jour |
| 5 | Le harness relié au juge | fait le 2026-11-04 : l'outil `judge` lance le binaire du noyau sur un ordre et le contexte tiré de la `GateDecision`, lit son verdict par `readVerdict` ; test d'intégration `apps/harness/test/judge.kernel.test.ts`, dans `test:genkan` et la tâche Lean de la CI |
| 6 | Le suivi en ligne de HIKAE branché dans `gate` | le suivi (`packages/hikae/src/suivi` et `pari`, qu'aucun code du harness n'importe aujourd'hui) lit les étiquettes arrivées et peut changer la décision de `gate`, avec son test |
| 7 | Le harness réduit à HIKAE et Genkan | `attest` et `cascade` sont retirés ; `packages/monark` et `packages/ukemi` sont archivés |
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
| Le noyau dans le harness | `judge` passe d'abord par le gate : une enveloppe qu'il refuse (un signal périmé, par exemple) est une erreur d'outil pour tout ordre, une EXIT comprise. Le noyau est lancé en synchrone (`spawnSync`) : chaque appel tient le serveur le temps du noyau (environ 30 ms mesurés sous Windows, au plus 10 s) ; un lancement asynchrone viendra quand le harness servira plus d'un appelant à la fois |
| Règles du juge | TRANSFER et APPROVE toujours refusés ; la cible doit être une place listée ; une EXIT y passe quelle que soit l'action de HIKAE, sans plafond (confirmé par le fondateur le 2026-11-04 ; l'exécuteur la passe en reduce-only) ; tout autre ordre exige COMMIT, un actif listé et un montant au plus égal à son plafond (un plafond vaut par ordre, pas en cumul) ; un SWAP, un actif de sortie listé et un `minOut` non nul |
