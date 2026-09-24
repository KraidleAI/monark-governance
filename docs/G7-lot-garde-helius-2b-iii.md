# G7 — GARDE-HELIUS-2b-iii (scripts de recensement U-4 sous `@monark/rpc-guard`) — ACCEPTED, fusion `985fed9`

Orchestrateur Fable 5.1 (`claude-fable-5-1`), 2026-09-22 01:12 UTC (`date -u`). Branche `lot/garde-helius-2b-iii-r` @ `d311809`, rebasée sur `5394dfe` (2b-ii), fusionnée `--no-ff` dans `lot/etude-suite`. Clôt la chaîne GARDE-HELIUS-2b (i → ii → iii).

## 1. Oracle complet sur l'arbre FUSIONNÉ `985fed9` (clés payantes retirées du process, codes capturés directement)
`npm run ci` → 0 : tests **779 / 778 pass / 0 fail / 1 skip** (`fetch_only_inside_client # until 1b` — le skip `u4_redraw_selects_by_book_digest_seed` de 2b-ii est levé, attendu final tenu) ; `lint` 0 ; `lint:ratchet` 0 (69/69) ; `lang:gate` 0 ; `export:check` 0. Logs `F:\tmp\g7-2biii\*.log`. R-25 (pathspec CI, docs exclus) vs `5394dfe` : 5 fichiers, +733/−194.

## 2. Lignée
| Étape | Référence | Résultat |
|---|---|---|
| Plan | `docs/G0-lot-garde-helius-2b-ii.md` annexe C-9 → 2b-iii ; décision 121 | — |
| G2 | `docs/G2-lot-garde-helius-2b-iii.md` (C-G-1..4) | PASS-AVEC-CORRECTIONS |
| Checkpoint-2 | `docs/CHECKPOINT2-lot-garde-helius-2b-iii.md` (C-R-1..6 ; C-R-1 = replay de blob de base fragile) | ACCEPTE-AVEC-CORRECTIONS |
| Pli + rebase | `d311809` : sha de référence committés (indépendance de profondeur git), `u4_redraw_spends_only_through_guard`, `--max-ru`/`--floor` câblés, régime payant `NoQuorumError` post-R-A, composition script → ledger → `reconcile`, pont d'identité RETIRÉ + test `===` strict, grep littéral + liste fermée d'imports, `u4-probe.mjs` supprimé ; union ADR par `union.py` | — |
| G2-delta (reprise, sous `env -u`) | `docs/G2-DELTA-lot-garde-helius-2b-iii.md` : 779/778/0/1 ×2, C-R-1 reproduit sans `.git` (16/16, 0 skip), mutants 18/21 rouges + 3 inertes raisonnés, R-25 927 = 1 294 − 367 (pli 2b-ii-c) | PASS |

## 3. Livré
`scripts/census/u4-guard.mjs` (ouverture gardée, classes du paquet ré-exportées par `rpc2`, aucun pont) ; `u4-book.mjs`/`u4-redraw.mjs` dépensent uniquement à travers le garde (test clé-indépendant) ; références sha `raw 76beb089… / inputs 5f3dcf2c… / redraw ed2eaf59…` committées pour le rejeu byte-identique ; refus `--max-ru`/`--floor` ; grep CI fail-closed sur `scripts/census/u4-*` (nom littéral + imports fermés).

## 4. Branchement (règle 2026-09-19)
Les scripts U-4 sont consommateurs du paquet par chemin réel + test de composition non-LLM (script → ledger → reconcile GO/NO-GO). Chaîne 2b close : le recorder (2b-ii) et le recensement (2b-iii) passent tous deux par `openGuardedClient`. `@monark/rpc-guard` reste **`branché`** ; `built` à la première course rapprochée (U-4b-1b, ruling R-C).

## 5. Items formés (propriétaire orchestrateur)
- **Unifier les deux tests de grep** (2b-ii `ukemi/**` vs 2b-iii `scripts/census/u4-*`) en un seul à liste de racines — déclencheur : 1b-0 (qui touche déjà le paquet) ou premier lot Ukemi suivant ; R-25 ≈ 40.
- `DELIVERED.sha256` du lot antérieur au rebase (ADR = union) : re-manifesté par ce G7 (le manifeste faisant foi est l'arbre fusionné `985fed9`).
- Facultatif : une ligne « `u4-probe.mjs` supprimé en 2b-iii » dans `PROVENANCE-u4.md:40` et `ADR-U4-book-et-calibration.md:13` (provenance historique U-4a, aucune exécution ne le cite).
- Cartographie : diff `carto.mjs` à la clôture du temps 1 (arêtes `u4-*.mjs → packages/rpc-guard`).

## 6. `error_origin`
C-R-1 (rejeu dépendant de la profondeur git) : plan (orchestrateur, clone archive) ; C-G-3 (pont d'identité) : worker ; C-R-2..4 : worker (couverture) ; rebase ADR : mécanique (union), vérifié G2-delta point 7. Incident A-7 (valeurs de clé dans un transcript de relecteur, 2b-iii G2 initial) : clos sans rotation (décision investisseur), règle A-7 appliquée aux deux passes suivantes.

## 7. MAST résiduel
FM-2.x (dérive d'outillage entre lots) soldé par le rebase + oracle sur l'arbre fusionné ; résiduel nommé : deux greps parallèles jusqu'à unification (item ci-dessus).
