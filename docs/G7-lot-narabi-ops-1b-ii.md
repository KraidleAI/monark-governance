# G7 — Narabi NARABI-OPS-1b-ii (-a alerte mail SMTP + -b détection de jour manquant / cross-check `state.json`, état fusionné) — ACCEPTED
Orchestrateur `claude-fable-5-1`, 2026-09-21 ~11:10 UTC. Fusion `--no-ff` sur `lot/etude-suite` (branche `lot/narabi-ops-1b-ii`, base `79374f2`, HEAD de lot `d22c214`).

## Vérifications de l'orchestrateur (exécutées, pas lues)
- **CI complète sur l'arbre FUSIONNÉ** (`npm run ci`) : `gate:vocab` OK (190 fichiers), typecheck 0, **646/646**, exit 0 (`scratchpad/ci-narabi.log`).
- R-25 : `lot/etude-suite...lot/narabi-ops-1b-ii` pathspec `ci.yml:65` = 1 626 + 64 = **1 690 > 1 205** — **déclaré, non-FAIL par mandat** : deux unités relues séparément (-a 1 094, -b 548 ; chacune avec G2 + checkpoint-2 en isolation) + composition 46 lignes (test du tuyau fusionné C5) relue par une G2 séparée de l'état fusionné (`docs/G2-lot-narabi-ops-1b-ii-merge.md`, 11 mutants rouges) et acceptée par le validateur (rejeu 612/612, M1/M2 rouges). Le gate R-25 de la CI GitHub échouerait sur une PR unique : la fusion est locale `--no-ff` (pas de PR), conforme à la voie « deux PR déjà relues ».
- Chaîne des corrections du checkpoint-2 fusionné (C1..C8, dont mes deux blocs shell cassés — `error_origin` orchestrateur) vérifiée sur pièces par le validateur : `bash -n` des blocs RUNBOOK, `ARGC=1` sur le `ssh`, `/usr/bin/env node`, four-term `probe.service` (100 s < 120), décision 109 portée ADR/PLI.
- Aucun vrai mail (tous les tests sous `env -u SMTP_* -u ALERT_*`, loopback) ; aucun secret dans le dépôt (`no_secret_in_repo` vert) ; aucun réseau.

## Chaîne
-a : G0/checkpoint-1 → G1 → G2 → G2-delta → checkpoint-2 (4 docs pliées `68c849b`). -b : idem → checkpoint-2 (isolation). Fusion `e87d7b5` (composition worker + 2 clés dupliquées retirées) → **G2 de l'état fusionné ‖ checkpoint-2 de l'état fusionné (régime B)** → corrections docs orchestrateur (`9e9190a`, `9644715`) + C5 par reprise (`57d5d69`) → rapport G2 persisté (`d22c214`) → ré-acceptation ACCEPTE → G7.

## error_origin (assigné)
C1/C2 (blocs shell RUNBOOK cassés par une correction orchestrateur) **orchestrateur** ; C3 (`ssh` quoting) orchestrateur ; C5 (aucun test d'intégration du tuyau fusionné `state_mismatch → mail`) worker composition + orchestrateur (couverture) ; C-G2M-1 (HEAD a bougé pendant la G2) orchestrateur ; C-G2M-2 (`.output` de composition vide) outillage ; 2 clés dupliquées d'auto-merge : outillage git (attrapé par le worker).

## Registre et déploiement (décisions 58, 72, 92, 109)
`upcoming` jusqu'au **premier mail réel consigné au JOURNAL**. Déploiement par le **SHA G7 nommé = celui de cette fusion**, sur le VPS (sonde `monark-probe.service` TimeoutStartSec 120 ; `monark-sentinel.service` 300) : **le mot de passe SMTP est posé par l'investisseur** (`read -rs`, RUNBOOK `:328-336`), jamais par un agent, jamais `source` d'un fichier d'env. E-5 (VPS site avec pool révisé) après la fusion de POOL-RPC-1a (Mode A résiduel, 109). Lot séparé `run.ts` (rattrapage ≥ ~12 j) AVANT E-5 — G0 à écrire. Caveat CA-9 reconduit : `node_modules/@monark/*` lie en absolu vers `F:\Monark` — à traiter avant tout lot éditant `apps/`/`packages/` en worktree (item formé, orchestrateur).
