# G7 — Bell T-1a-ii-b3d-b1b (sonde de densité `--rebase-density` + projection H6 hors process) — ACCEPTED (`upcoming`)
Orchestrateur `claude-fable-5-1`, 2026-09-21 12:4x UTC (horloge). Fusion `--no-ff` sur `lot/etude-suite` (branche `lot/t-1a-ii-b3d-b1b`, base `d8d25e3`).

## Vérifications de l'orchestrateur (exécutées, pas lues)
- **Oracle complet sur l'arbre FUSIONNÉ** (`npm run ci && npm run lint && npm run lint:ratchet`, règle ADR-C01 complément) : `gate:vocab` OK (202 fichiers), typecheck 0, **697 tests : 696 pass, 0 fail, 1 skip déclaré** (full-scope `rpc-guard-fetch-only`, déclencheur GARDE-HELIUS-1b) ; **`eslint .` = 0 ; ratchet 69/69** — la dette g4 laissée par la fusion b1a (1 erreur eslint `rebase-crosscheck.test.ts:600` + ratchet 70/69) est RÉSORBÉE ici. Journal `scratchpad/ci-b1b.log`.
- R-25 : `lot/etude-suite...lot/t-1a-ii-b3d-b1b` pathspec `ci.yml:65` = 304 + 11 = **315 ≤ 1 205** (3 fichiers).
- `git show --stat` de chaque commit du lot confronté à son message (règle ADR-C01 complément 2) après le défaut ci-dessous.
- Aucun appel réseau (course SUSPENDUE ; stubs) ; aucun crédit consommé.

## Chaîne
G0 (`docs/G0-lot-t1a-ii-b3d-b.md` L-b1b-1/2, checkpoint-1 `6d26117`) → G1 (`8646c62`) → G2 séparée ‖ checkpoint-2 (régime B) → checkpoint-2 ACCEPTE-AVEC-CORRECTIONS (C-V-1..4) → C-V-2 pliée par l'orchestrateur (`f4b0d9c`, texte de l'Amendement 3(4) corrigé AVANT son commit solo) → pli du worker… **committé à vide `8c82535`** (doc seul), attrapé par le validateur (ré-acceptation REFUSÉE) → pli réel `06795cc` (fichiers restaurés byte-exact du snapshot livré, sha vérifiés, oracle rejoué par l'orchestrateur) → ré-acceptation ACCEPTE → G2 PASS-AVEC-CORRECTIONS (cible `8646c62` + G2-delta `8646c62..06795cc`, 12 mutants rouges) → G7.

## error_origin (assigné)
- C-V-1 / C-G2-2 (tuyau sonde→projection annoncé, non exécuté depuis l'artefact réel ; assertion perdue dans une restauration de snapshot) : **worker G1**.
- C-V-2 / C-G2-1 (formule de densité de grille dans l'Amendement 3(4) : indéfinie au dernier nœud, sous-projette d'un facteur pas-de-grille/span-de-page — 1 575 vs 157,5 sur la fixture) : **rédacteur du pli G0-b + validateur checkpoint-1**.
- Commit `8c82535` au message non confronté à son `--stat` : **orchestrateur** ; pli resté hors dépôt (2ᵉ occurrence) : **worker**. Règles écrites : ADR-C01 compléments 1 et 2.
- Dette g4 (eslint + ratchet) fusionnée avec b1a : **orchestrateur (G7 b1a)** ; résorbée ici (cast retiré ; `readCC` typé `CrosscheckArtifact`, jamais `any`, plafond intact) — les deux corrections prouvées porteuses par la G2.

## Items formés (déclencheur, propriétaire)
- **C-G2-3** : `runDensityProbeCli` (`rebase-crosscheck.ts:699/705`) écrit `require_full_pages` sans lire `prior.requireFullPages` ⇒ une sonde stricte sur un `--out` lâche masquerait la garde mixed-mode du tirage. Aucun chemin canonique ne l'atteint (sonde en premier, audit sur `--out` distinct). Déclencheur : **G0 de la course** ; porteur : lot -f ou b1a-bis ; propriétaire orchestrateur.
- **Amendement 3** : à committer SEUL (commit docs isolé) avant la sonde de densité — maintenant que b1a ET b1b sont fusionnés ; texte (4) déjà corrigé (`f4b0d9c`).
- Condition (f) ITEM-A : lot -f, plan plié `c83ff2e`, **G1 débloqué par cette fusion**. C-F-4 : question investisseur (ancrage par page) au G0 de la course.

## Registre (C-V-4)
L-b1b-1/2 **`upcoming`** : le consommateur servi (l'orchestrateur, hors process, à la sonde) n'existe pas avant la course. Course toujours SUSPENDUE : GARDE-HELIUS-1b, lot -f, Amendement 3 committé seul, -iii-a1-bis pour l'univers. Bell reste `upcoming` dans tout registre public du temps 1 (décision 117).
