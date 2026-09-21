# G7 — Bell T-1a-iii-a1 (univers Solana, énumération + identité on-chain) — ACCEPTED
Orchestrateur `claude-fable-5-1`, 2026-09-21 06:20 UTC. Fusion `--no-ff` `9a2fca9` sur `lot/etude-suite` (branche `lot/t-1a-iii-a1`, base `bfcc7cd`, HEAD de lot `c546fcd`).

## Vérifications de l'orchestrateur (exécutées, pas lues)
- Ré-acceptation sur pièces (checkpoint-2 REFUSE → liste fermée C-1..C-4) : les 6 littéraux synthétiques de la fixture = **0 hit** sous `F:\PRODUITS\` (grep par valeur) ; sha fixture `25cc8325…` ; ADR-T1aii D1-septies porté ; `npm run ci` sur le lot = **500/500**, exit 0.
- **CI complète sur l'arbre FUSIONNÉ** : `gate:vocab` OK (188 fichiers), typecheck 0, **573/573**, exit 0.
- R-25 : `bfcc7cd...lot/t-1a-iii-a1` avec le pathspec `STAT=` de `ci.yml` = **1 195 ≤ 1 205** (6 fichiers, insertions seules).
- Pré-enregistrement : §1-10 du PLI byte-identiques à `cf07ee2` (vérifié par le validateur ; 0 suppression).
- Aucun appel réseau dans ce lot (course non lancée) ; aucun crédit consommé.

## Chaîne
G0 (`docs/G0-lot-t1a-iii-univers-solana.md`) → checkpoint-1 → PLI committé SEUL (`cf07ee2`) → G1 (`c1418bf`) → G2 séparée (`docs/G2-lot-t1a-iii-a1.md`) → pli → G2-delta séparée (`docs/G2-DELTA-lot-t1a-iii-a1.md`) → pli docs → checkpoint-2 (`docs/CHECKPOINT2-lot-t1a-iii-a1.md`, REFUSE clause anti-close) → pli C-1..C-4 → ré-acceptation sur pièces → G7.

## error_origin (assigné)
C-G2-1..5 worker G1 ; C-G2-6/7 worker + plan (R-25) ; C-G2D-1 worker (revendication sous-dimensionnée), cause infra pré-existante ; C-G2D-2 worker (dérogation non établie) ; C-G2D-3 worker ; **C-1 (constantes réelles sous étiquette synthétique) worker + relecteurs G2 et G2-delta** ; **C-2 (ADR non porté) orchestrateur** ; la clause anti-close a depuis été amendée (décision 110) — sans effet rétroactif.

## Registre
Tout `upcoming` (aucun consommateur servi ; Bell absent du site/README/skills/export). Première course GATÉE par : (i) -iii-a1-bis (C-G2-6, C-G2-7 ledger chaîné — bloquant car Chainstack facture l'usage supplémentaire, C-G2D-1, C-G2D-3) ; (ii) B-IV-2 conditions Chainstack ; (iii) GARDE-HELIUS ; au go : `--date`/`--out` ré-enregistrés (PLI §6 amendé). Item : rejeu checkpoint-2 post-course depuis le brut sha-pinné.
