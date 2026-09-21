# G7 — EXPORT-CLEAN (miroir public : hygiène des chemins, exclusion u4, `export:check`) — ACCEPTED
Orchestrateur `claude-fable-5-1`, 2026-09-21 ~08:55 UTC. Fusion `--no-ff` sur `lot/etude-suite` (branche `lot/export-clean`, base `671b8f2`, HEAD de lot `12c54ef`).

## Vérifications de l'orchestrateur (exécutées, pas lues)
- **CI complète sur l'arbre FUSIONNÉ** (`npm run ci`) : `gate:vocab` OK (188 fichiers), typecheck 0 erreur, **577/577**, exit 0 (journal `scratchpad/ci-xclean.log`).
- R-25 : `lot/etude-suite...lot/export-clean` avec le pathspec `STAT=` de `ci.yml:65` = 447 + 11 = **458 ≤ 1 205** (10 fichiers).
- Ré-acceptation sur pièces (régime B, décision 116) : checkpoint-2 **ACCEPTE** sur `12c54ef` après rejeu indépendant (copie fraîche, 554/554 sur le lot, sonde regex positive/négative, mutant regex revertie ROUGE, export réel 284 kept / 0 segment privé / 0 chemin échappé, R-25 458 recomputé). Ce checkpoint-2 **vaut oracle indépendant** des plis `a0b4c1b` et `12c54ef` (C-3).
- Aucun appel réseau, aucun crédit consommé.

## Chaîne
G0 (`docs/G0-lot-export-clean.md`) → checkpoint-1 → G1 (`74a0058`) → G2 séparée (`ab8de7e`, `docs/G2-lot-export-clean.md`) → pli (`a0b4c1b`) → docs (`47e3e48`, `096cded`) → checkpoint-2 ACCEPTE-AVEC-CORRECTIONS (C-1..C-4) → C-1/C-2 par l'orchestrateur (`47e3e48`), C-4 par reprise du worker (`12c54ef`) → ré-acceptation sur pièces ACCEPTE → G7.

## error_origin (assigné)
C-G2-1..3 worker G1 ; **C-1 (segments privés réels cités dans le G2) relecteur G2** ; **C-2 (contradiction `error_origin` ADR ↔ code) orchestrateur** (rédaction ADR-M004 D7 septies) ; C-3 (trace du pli) orchestrateur ; **C-4 (forme échappée `X:\\…` non couverte, fail-open non déclaré) worker G1 + relecteur G2** (classe manquée par les deux).

## Items formés (non bloquants, cités par le validateur)
- `export:check` absent de la CI : CHANTIERS:221, déclencheur « avant la fenêtre publique », propriétaire orchestrateur.
- Politique des mentions `F:\PRODUITS\…` tronquées dans les docs de gouvernance (71 fichiers de la base) : observation, à trancher à la clôture (cartographie) — propriétaire orchestrateur.

## Registre
Aucun changement d'état « built » : le miroir public reste un export local (`scripts/export-public.mjs`), non servi tant que la fenêtre publique n'est pas ouverte (T-1b). Les 4 fichiers u4 sont hors miroir (décision 111).
