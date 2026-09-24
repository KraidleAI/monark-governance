# G7 — lot E-registre (ADR-EC D1, régime site T2, décision 25 / D9 septies) — verdict de l'orchestrateur
Orchestrateur `claude-fable-5-1`, 2026-09-19. Gel du lot : **`bd3fa0a`** (base `ac04d41`, branche `lot/e-registre`, worktree `F:\Monark-wt-eregistre`). Fusionné sur `lot/etude-suite` en **`3f2f19c`** (0 marqueur de conflit ; 9 fichiers, +408/−50).

## Verdict : **CLOS — ACCEPTÉ**
Chaîne de vérification indépendante (instances séparées, contexte frais) :
1. Livraison worker `claude-opus-4-8[1m]` max `7d6d117` (`site[T2]`) → G2 fraîche Opus 4.8 (`docs/G2-lot-e-registre.md`, APPROUVÉ-AVEC-CORRECTIONS C-1/C-2/O-1) → pliage worker `bd3fa0a` → delta `7d6d117→bd3fa0a` revu CONFORME par une autre instance (`61a78b4`).
2. **Checkpoint-2 validateur `claude-fable-5-1` sur `bd3fa0a`** (`docs/CHECKPOINT2-lot-e-registre.md`) : ACCEPTE-AVEC-CORRECTIONS V-1..V-3 + escalade Q-1 ; oracle rejoué (328/328, ratchet 69/69, `next build` 13/13, R-25 297), 12 mutants rouges dont D9b hors batterie, CA-11 T2 conforme (4 built / 12 upcoming assertés, E2 = cartographie ligne à ligne, E6 note digit-free servie sur `/fleet`).
3. Pliage orchestrateur (docs seuls, `b94aff1`) : V-1 (a)-(d) — amendement daté ADR-W1, ADR-EC D1, CHANTIERS, RAPPORT-PASSE-P1 ; V-3 formé (item **CI-site**, code bloquant release) ; Q-1 en escalade §A.
4. Fusion `3f2f19c` ; **oracle sur l'arbre fusionné : 328/328 (rc 0), tsc 0, lint 0, ratchet 69/69, gate:vocab 156 OK, lang-gate 0, export:check 0** (log `F:\tmp\orch\merged-3f2f19c-test.log`). Note : le scope lang-gate `sentinel`/`bell` n'existe pas encore sur cet arbre — il arrive avec E-honnêteté.

## Provenance / `error_origin` (V-2)
- C-1/C-2 (G2) : générateur (worker) ; propagation ADR : orchestrateur.
- **O-4 tranché** : l'addendum ADR-M003 D9 septies désigne un incident réel — **accumulation de 11 segments sur `lot/etude-suite` sans PR vers `main`** (esprit R-25 : PR petites et fréquentes) — `error_origin = orchestrateur` ; l'origine de la règle elle-même est la décision investisseur 25 (pas un incident).
- V-1 (ADR-W1 non amendé, type scalaire) : rédacteur ADR-W1 = orchestrateur. V-3 (`next build` absent de CI) : origine antérieure au lot (planificateur P1), détecté par le validateur.
- Journal : ligne ajoutée à `docs/JOURNAL-PROVENANCE.md`.

## Items formés (déclencheur), zéro dette nue
- **CI-site** (V-3 + O-2, code bloquant release) : job/étape `next build` dans `ci.yml` + garde (6) sur `fleet.html` — propriétaire orchestrateur, lot `lot/ci-site` avant la cartographie pré-release.
- **Q-1** (escalade investisseur) : PR d'intégration 9 129 lignes sous R-25 ; recommandation (i) PR séquentielles par segment.
- O-3 clos (V-1c). O-4 clos (ci-dessus). AM-2 ter : ratification investisseur due (règle disque).

## Branchement (ADR-M018, CA-11)
Registre : 4 built / 12 upcoming, aucun promu ; chaque built porte `integration_test[]` = jambes mesurées de la cartographie ; `wiring.note` servie sur `/fleet` (HTML produit vérifié) ; tuyaux ADR-EC présents et rejoués.
