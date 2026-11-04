# ROADMAP — le moteur MONARK (HIKAE + Genkan)

Mis à jour le 2026-11-04. Une ligne qui change remplace l'ancienne ; l'historique est dans git, pas ici.

## Où on en est (vérifié sur le code le 2026-11-04)

- **Tests** : `npm run ci` est vert (vocabulaire, typecheck strict, 594 tests sur 594, hors noyau Lean) ; `npm run
  test:genkan` aussi, noyau compris (30 tests sur 30). `npm run lint` et `npm run lint:ratchet` sont verts ; le plafond de
  dette de typage des tests est à 60.
- **HIKAE** (`packages/hikae`) : les trois couches sont là. L1 fait le split conforme par classe, L2 le moniteur et le
  budget `B_t`, L3 la politique qui rend une `GateDecision`. Le suivi en ligne aussi : une bibliothèque de paris en
  rationnels exacts, un détecteur de changement à redémarrage pondéré, une politique par cellule, le moniteur M1, une garde
  de pas, et le test de la durée moyenne avant fausse alarme (PR #344, #348, #349, #352, #353).
- **Harness** (`apps/harness`) : un serveur MCP à quatre outils, `gate`, `calibrate`, `attest` (Shōgen) et `cascade`
  (UKEMI). Ses classes viennent toutes de l'ancien périmètre : USDe stable-run, liquidations UKEMI, et 32 classes
  kata (BTC, ETH, BNB, SOL). La stratégie du fondateur n'y est pas encore.
- **Genkan** (`apps/genkan`) : un noyau Lean 4.32.1. Il répond à deux modes : le mode 2 décode un ordre `GNK1`, le mode 3
  calcule un SHA-256. Toute autre requête est refusée (code de sortie 3). Le noyau a un audit de ses sources et des
  enregistrements d'axiomes ; chaque module est rejoué par `leanchecker` ; les mutants du décodeur sont tués (PR #340, #343,
  #346, #347, #350, #351, #354). **Le juge n'existe pas encore, et le noyau n'a aucun théorème.**
- **Fil ouvert** : la PR #345 (`lot/hikae2-p1-ls`) fait abstenir la porte USDe stable-run hors du support calme de sa
  calibration. Elle porte sur une classe héritée ; elle attend le choix du fondateur.

## Les étapes

| # | Étape | Finie quand |
|---|---|---|
| 1 | Le recentrage : archive, cinq documents, CI réduite | faite le 2026-11-04 ; reste à réécrire les README de `packages/hikae`, `packages/ukemi` et `apps/harness`, qui citent encore des ADR archivés |
| 2 | La stratégie du fondateur, écrite dans `STRATEGIE.md` | ses signaux, ses marchés, ses horizons et ses règles de sortie sont écrits |
| 3 | L'adaptateur stratégie → `Prediction`, puis la calibration de ses classes | `gate` rend COMMIT, DEFER ou ABSTAIN sur un signal réel de la stratégie, avec son test |
| 4 | Le juge de Genkan en Lean, avec ses théorèmes | le mode juge existe, ses refus sont prouvés, et la CI rejoue les preuves |
| 5 | Le harness réduit à HIKAE et Genkan | `attest` et `cascade` sont retirés ; `packages/monark` et `packages/ukemi` sont archivés |
| 6 | Le bout en bout sur papier | un signal passe HIKAE, puis Genkan, et sort en ordre simulé ; le journal se rejoue |
| 7 | Le premier ordre réel | sur go du fondateur, ordre par ordre |

## Choix en vigueur

| Sujet | Choix |
|---|---|
| Périmètre | HIKAE, le harness et Genkan ; le reste est à l'archive `F:\ARCHIVE-MONARK-2026-11-04\` |
| Langages | TypeScript strict sur Node 24 (`node:test`) ; Lean 4.32.1 pour le noyau de Genkan |
| Contrats | les schémas de `schemas/` font foi ; `packages/contracts` en est la liaison TypeScript |
| Garantie de HIKAE | couverture marginale, en échantillon fini, sous échangeabilité dans la classe ; jamais une probabilité d'avoir raison |
| Dépôt | `KraidleAI/monark-governance`, public ; branche de travail `lot/etude-suite` ; rien n'est poussé sans accord |
| CI | quatre tâches : tests, lint, audit des dépendances, noyau Lean |
| Ordres et argent | aucun ordre réel, dépôt, retrait ou transfert sans go du fondateur, ordre par ordre |
