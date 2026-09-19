# G7 — lot U-1b-b (+ plis U-1b-b-2, U-1b-b-3) : adaptateur `AttestedBook`, canonicaliseur unique, producteur, O-1/O-2/O-3 — VERDICT : ACCEPTÉ, FUSIONNÉ
Orchestrateur `claude-fable-5-1`, 2026-09-19. Gel `cba115f` sur `lot/u-1b-b` (livraison `04d45d4`, pli 2 `a049cd3`, pli 3 `cba115f` ; base `8c8eac8`). Fusion `--no-ff` sur `lot/etude-suite`.

## Chaîne de preuve
| Maillon | Artefact | Résultat |
|---|---|---|
| Checkpoint-1 | `docs/G0-lot-u1b-b.md` + C-1..C-7 | approuvé-avec-corrections (canonique unique déplacée, producteur exigé, envelope typée) |
| G1 worker Opus 4.8 max | `docs/PLI-lot-u1b-b.md` | 389/389, 8 mutants rouges, zone gelée intacte, R-25 587 |
| G2 fraîche Opus 4.8 | `docs/G2-lot-u1b-b.md` | APPROUVÉ-AVEC-CORRECTIONS (C-G2-1 survivant MA, C-G2-2 typo) → pli 2 |
| Checkpoint-2 | `docs/CHECKPOINT2-lot-u1b-b.md` | ACCEPTE-AVEC-CORRECTIONS (C-V1 verrou producteur : MV3/MV4/MV5 survivants ; C-V2) → pli 3 ; G2 delta du pli 2 absorbée |
| G2 delta bornée | `docs/G2-delta-lot-u1b-b-3.md` | CONFORME, ligne C-V1 portante (MV3-5 + MX tués par elle seule) |
| Checkpoint-2 bis | (message validateur, persisté ici) | ACCEPTE : sha test `e117edbb…`, MV3 rouge, zone gelée = objet signé |
| G7 orchestrateur | ce fichier | oracle sur l'arbre fusionné : **390/390** (389 + 1 de H-attested déjà fusionné), lint 0, ratchet 69/69, lang-gate 0, export:check 0 (`F:\tmp\g7-u1bb-ci.log`) ; fusion auto sans conflit |

## Ce que le lot livre
`packages/monark/src/book-canonical.ts` (définition unique de `canonicalStringify`, `bookDigest`, `canonicalAttestedBook` typée : entiers sûrs ou rejet nommé, jamais `{}`) ; `apps/sentinel/src/ukemi/book.ts` réduit à un import ; `packages/monark/src/adapter-book.ts` : `fromAttestedBook` pur fail-closed (table fermée par clé, erreurs `binding_broken | non_evaluable`) et `toAttestedBook` producteur ; test de composition `recordBook → toAttestedBook → serialize → fromAttestedBook` = PIN `034fbff9…` et sortie byte-identique à la fixture ; O-1 `n_positions`, O-2 sondes ajv, O-3 profondeur closed-check. Zone gelée byte-identique à l'objet signé (`8ba71122…` / `d50f5c51…`) : **rien à signer**.

## Branchement (CA-11)
`AttestedBook` reste `upcoming` (chemin servi = U-6) ; producteur + consommateur livrés, déclarés ADR-U1b D7 ligne 1 ; `fleet.ts`, README, site inchangés.

## R-25
591 sous la pathspec UNION (< 1 205) ; cible 400 du G0 dépassée : `error_origin` **checkpoint-1** (C-2/C-3/C-4 ont élargi le périmètre sans ré-estimation) ; « lot unique » non contesté par G2 ni validateur (aucun découpage respectant C-3 ne passe sous 400).

## error_origin
C-G2-1 (trou de test quorum distinct) et C-G2-2 : worker. C-V1 (verrou producteur) : checkpoint-1 primaire, worker secondaire. C-V2, sha snapshot §1 et formule deux-points l.104 du PLI : worker des plis (doc non re-baselinée) — note : le §1 du PLI décrit l'état à `04d45d4`, les annexes 2 et 3 portent les sha courants.

## Items formés
**I-1** : correspondance `eligible` du producteur non falsifiable sur la fixture WETH (0 éligible) ; déclencheur : première fixture recorder avec `eligible > 0` (U-6 ou seconde fixture) ⇒ rejouer MV1/MV2, attendus rouges par C-V1 ; propriétaire orchestrateur. K-1 (clé réelle, domaine `attestor.sig` ; `canonicalAttestedBook`/`attestedBookDigest` prêts) ; `recorder_revision` placeholder → sha des sources `ukemi/**` à U-6 ; U-6 chemin servi ; U-4 union gate + `Prediction`.
