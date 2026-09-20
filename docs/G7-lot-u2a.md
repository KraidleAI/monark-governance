# G7 — sous-lot U-2a : treillis Q_*/Q^* dans `packages/ukemi`, Λ = 0 = liquidable statique, formes de demande, prédicteur v0 retiré du paquet — VERDICT : ACCEPTÉ, FUSIONNÉ
Orchestrateur `claude-fable-5-1`, 2026-09-20. Gel `cc2733d` (base `5fe6c12`), revue `0538bbf`, pli 2 `705093f`, checkpoint-2 + C-V-1/2 `e095889`. Fusion `--no-ff` `58596b6` sur `lot/etude-suite`.

## Chaîne de preuve
| Maillon | Artefact | Résultat |
|---|---|---|
| Checkpoint-1 U-2 | `docs/CHECKPOINT1-lot-u2.md` | ESCALADE (Q1-Q3) → décision 51 (Ukemi reste built ; U-2b absorbé dans U-4) ; découpe U-2a |
| Checkpoint-1 U-2a | `docs/CHECKPOINT1-lot-u2a.md` + C-1..C-11 | approuvé-avec-corrections |
| G1 worker Opus 4.8 max | `docs/PLI-lot-u2a.md` | 420/420, 7 mutants, R-25 654, pin h5 inchangé |
| G2 fraîche Opus 4.8 | `docs/G2-lot-u2a.md` | ACCEPTÉ, 10 axes re-exécutés, OBS-1..3 |
| Pli 2 (OBS-1) | annexe PLI | `expected` des fixtures câblé en test paramétré fail-closed ; mutant m-fx rouge ; R-25 693 |
| R-21 orchestrateur sur le pli 2 (C-V-4) | ce fichier | les +39 lignes lues : découverte dynamique des fixtures, fail-closed via `loadLatticeScenario` (throw), assertions Q_*/Q^* sous le Λ et la forme déclarés, garde de non-vacuité sur a/b/c ; tests 9/9 avant commit ; mutants du validateur m1 7/2 et m-fx 8/1 sur ce code |
| Checkpoint-2 | `docs/CHECKPOINT2-lot-u2a.md` | ACCEPTE-AVEC-CORRECTIONS C-V-1..4 (rejeu à froid 9/9 + 9/9, 4 mutants dont 2 inédits, WETH `89085f7c…`, pin h5) |
| G7 | ce fichier | arbre fusionné **421/421** (412 + 9), lint 0, ratchet 69/69, lang-gate 0, export:check 0 (`F:/tmp/g7-u2a-ci.log`) |

## Ce que le lot livre
`packages/ukemi/src/lattice.ts` (T depuis `(P_crit, B)` sans `isLiquidable` ; `applyT` ; Q_* ascendant / Q^* descendant, borne N+1 ; `noDormantActivation` Prop. 4 ; `demand: linear | exponential` ; domaine Λ·ΣB < 1 fail-closed) ; fixtures scénarios a/b/c + WETH dérivée (N = 2, 0 éligible, rejouable) ; 9 tests ; `emitPrediction(yhat, producedAt, {predictorId, taskClass})` porté par l'appelant, littéraux v0 déplacés dans le harness (2 fichiers, comportement servi inchangé, pin h5 `4ca37d5c…`) ; ADR-U2 (lemme des points fixes ordonnés, ordre linéaire ≥ exponentielle, CPMM dérivé non implémenté, amendement daté ADR-M020 D4).

## Branchement (CA-11)
Treillis = `annex` (consommateurs : tests, papier U-7 ; bascule U-4). Rien de servi modifié ; `fleet.ts`, README, skills, registre MCP, trace h5 intacts. Ukemi reste `built` (décision 51).

## R-25
693 sous la pathspec UNION (≤ 720 cible C-4, ≤ 1 205).

## error_origin
OBS-1 (champ validé jamais asserté) : worker G1. C-V-1 (compte ADR périmé) : worker de pli + orchestrateur. C-V-2 (renvoi ADR-M020 absent) : validateur (checkpoint-1 §8) + orchestrateur. C-V-4 (pli 2 committé sans trace de revue) : orchestrateur — corrigé ici par la R-21 écrite. Décision 50 renversée par 51 : orchestrateur.

## Items formés
- **C-V-3** : clause intérimaire de la décision 51 (« description de l'outil `cascade` dit v0, replaced at U-4 ») = re-pin h5 ⇒ question à l'investisseur : abandonner la description intérimaire (skip ratifié) ou la servir avant U-4 par un micro-lot harness + re-pin ; propriétaire orchestrateur, déclencheur prochain contact.
- CPMM (lecture LVR ou procurement Angeris & Chitra 2020) ; `gate:vocab` étendu à `packages/ukemi` (liste negation-aware) ; C-12 ADL de perp licite (liste U-4) ; perf garde de domaine O(N³) avant rejeu sur book complet (U-7) ; OBS-3 renommage ADR avec 5 refs (prochain lot `docs/adr/`).
