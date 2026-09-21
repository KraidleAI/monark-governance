# G7 — Ukemi U-4b-1a (code de score OFFLINE sur e2 : ŷ close factor au premier franchissement, deux cellules, gel par sha) — ACCEPTED
Orchestrateur `claude-fable-5-1`, 2026-09-21 ~10:50 UTC. Fusion `--no-ff` sur `lot/etude-suite` (branche `lot/u-4b-1a`, base `2f4456f`, HEAD de lot `4ca23e3`).

## Vérifications de l'orchestrateur (exécutées, pas lues)
- **CI complète sur l'arbre FUSIONNÉ** (`npm run ci`) : `gate:vocab` OK (189 fichiers), typecheck 0, **607/607**, exit 0 (`scratchpad/ci-u4b1a.log`) ; `export:check` OK (0 chemin interdit) après ajout des 4 fixtures `u4b/` à `scripts/export-exclude-data.json` (**C-V-8**, décision 111 — fait dans ce commit de fusion, le fichier n'existant pas sur la base).
- R-25 : `lot/etude-suite...lot/u-4b-1a` pathspec `ci.yml:65` = 881 + 1 = **882 ≤ 1 205** (8 fichiers).
- Sha de gel LF vérifiés par l'orchestrateur sur le worktree à `1b4f8e2` : `u4b-scores.mjs` `9ad20666…`, `u4b-reduce.mjs` `a5e66cd3…`, `record-u4b-calib.mjs` `5733daeb…` (= ADR-U4b D4, `4ca23e3`). Diff de la ligne d'usage C-V-3 (viii) relu : commentaire seul.
- Ré-acceptation sur pièces (régime B) : **ACCEPTE** (C-V-3) sur `155ea22` par blobs HEAD (rejeu copie fraîche 561/561, 5/5 mutants des nouvelles gardes rouges, digests/pins/565 ŷ identiques). Pli docs C-V-1/4/5 + (viii) relu par l'orchestrateur (décision 116 (4)).
- Aucun appel réseau (e2 offline) ; aucun crédit consommé.

## Chaîne
G0 (`docs/G0-lot-u4b.md`, checkpoint-1 `2f4456f`) → G1 (`2be3a98`) → G2 séparée (`214968d`) ‖ checkpoint-2 (`docs/CHECKPOINT2-lot-u4b-1a.md`, ACCEPTE-AVEC-CORRECTIONS C-V-1..9) → pli G2 par reprise (`155ea22`) → ré-acceptation C-V-3 ACCEPTE → ADR-U4b (`4a0f849`, C-V-6) → pli docs (`1b4f8e2`) → sha ADR (`4ca23e3`) → G7.

## error_origin (assigné, C-V-9)
C-G2-1..4 worker G1 ; **C-V-1** (convention `D_tot` non déclarée) worker G1 + relecteur G2 (recompute non indépendante) ; **C-V-2** (gel incomplet : 3 imports transitifs) planificateur (orchestrateur) + validateur checkpoint-1 ; C-V-4 worker G1 ; C-V-5 rédacteur du pli ; **C-V-6** (ADR « adopté au G1 » non tenu) orchestrateur ; C-V-8 orchestrateur ; `predictorBase` non annoncé au pli : worker (accepté sur mutant).

## Items formés (déclencheur, propriétaire)
- **Prereg -1b** (avant tout appel) : fige les 3 sha D4 **+** `wadray.ts`/`abi.ts`/`l1-split.ts` (C-V-2) ; liste C-V-7 des choix avec effet mesuré ; `--concordance-out` (POOL-RPC-1a). Orchestrateur.
- « Expliquer agrégat ≠ Σ jambes » (`total_debt_base` > Σ floor de +1..+5 unités, 564/565) — avant la course -1b, orchestrateur (touche le book U-4a, zone `034fbff9`).
- `PR-U4-3-ter` (arrondi `CA`, `LiquidationLogic.sol` l.609-660) — avant le prereg -1b, orchestrateur (lecteur).
- U-4b-0 : consommer `@monark/rpc-guard` (après GARDE-HELIUS-1a puis -2).

## Registre
-1a **`upcoming`** (consommé par un test seul, C-V-5 ; aucun chemin servi avant -2). Classe B calculée, jamais servie (108). Fixtures u4b hors miroir (111).
