# G7 — Bell T-1a-ii-b3d-b1a (reprise/ledger/budget de la contre-vérification, option (d) pages courtes) — ACCEPTED
Orchestrateur `claude-fable-5-1`, 2026-09-21 ~09:10 UTC. Fusion `--no-ff` sur `lot/etude-suite` (branche `lot/t-1a-ii-b3d-b1a`, base `6d26117`, HEAD de lot `a01cb4e`).

## Vérifications de l'orchestrateur (exécutées, pas lues)
- **CI complète sur l'arbre FUSIONNÉ** (`npm run ci`) : `gate:vocab` OK (188 fichiers), typecheck 0, **596/596**, exit 0 (journal `scratchpad/ci-b1a.log`).
- R-25 : `lot/etude-suite...lot/t-1a-ii-b3d-b1a` avec le pathspec `STAT=` de `ci.yml:65` = 737 + 121 = **858 ≤ 1 205** (4 fichiers de code/test).
- Mutant `:506` rejoué rouge par l'orchestrateur au pli G2 (journal PLI-b1a) ; §2 (H1..H6) du PLI byte-intact (sha `7071484f…` recomputé par le validateur à `f2f8808` et `a01cb4e`).
- **Aucun appel réseau dans ce lot** (course SUSPENDUE ; tests sur stubs, `env` purgé). Dashboard Helius : deux lectures sur place ce jour (60 938 cr, inchangé ; 0 requête le 21/09) — aucun crédit consommé par b1a. Une lecture post-fusion sera faite avant la première course (condition HELIUS-1).
- Ré-acceptation sur pièces (régime B) : **ACCEPTE** sur `a01cb4e` ; les deux résidus docs du validateur sont pliés ici : (1) `docs/CHECKPOINT2-lot-t1a-ii-b3d-b1a.md` (verbatim du transcript, R-1 `claude-fable-5-1` déclarée), journal PLI-b1a mis à jour ; (2) note de supersession ci-dessous.

## Note de supersession (rapport G2 gelé)
`docs/G2-lot-t1a-ii-b3d-b1a.md:66` (ITEM-G2-A) porte encore « déclencheur b2/ADR-format ». **Supersédé** par `docs/PLI-lot-t1a-ii-b3d-b1a.md` §C-V-3 et `docs/G0-lot-t1a-ii-b3d-b.md` condition **(f)** : ITEM-A (payload `page_events`/`page_handoffs` non haché ⇒ verdict-flipping prouvé) est une **condition de GO de la course**, porteur b1b/b1a-bis, `headSha` doit commettre le payload. Le rapport G2 n'est pas réécrit (record d'instance séparée).

## Chaîne
G0 (`docs/G0-lot-t1a-ii-b3d-b.md`, checkpoint-1 `6d26117`) → G1 (`93446f8`) → option (d) + amendement L-b1a-1 (`f4ae59f`) → G2 séparée (`eeeeaef`) → pli G2 (`f2f8808`) → G2-delta par reprise (PASS, `docs/G2-DELTA-lot-t1a-ii-b3d-b1a.md`) ‖ checkpoint-2 ACCEPTE-AVEC-CORRECTIONS (C-V-1..5) → pli docs (`a01cb4e`) → ré-acceptation sur pièces ACCEPTE → G7.

## error_origin (assigné)
V-1/V-2/V-3 (faux `equal` par reprise, artefact écrasé, Σ calls) **plan -b3d (orchestrateur) + worker -b3d-a** ; C-G2-1..3 worker G1 ; ITEM-C (garde `=== false` nue) worker G1 ; notFullPages (option d) **plan (orchestrateur)** ; C-V-1 (docs de la sonde en retard sur le code) orchestrateur ; C-V-3 (ITEM-A sous-classé « b2 ») worker G1 + relecteur G2 + validateur ; C-V-4 journal worker rédacteur ; avis non persisté : outillage.

## Registre
Tout `upcoming`. **Course SUSPENDUE** jusqu'à : (a)–(e) HELIUS-1/GARDE-HELIUS (paquet `@monark/rpc-guard` 1a en G1, 1b Bell après cette fusion), b1b (densité/projection, helper K=8, Amendement 3), condition **(f)** ITEM-A. Item 7 du registre PLI (rejeu `committed_artifacts_replay` sur artefacts CLI) reste dû à la clôture post-tirage.
