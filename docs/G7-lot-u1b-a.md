# G7 — lot U-1b-a + U-1b-a-bis (contrat gelé `AttestedBook`, 6ᵉ contrat, décision 16) — VERDICT : ACCEPTÉ, FUSIONNÉ — régime `site[T0]`
Orchestrateur `claude-fable-5-1`, 2026-09-19. Gel `90b891d` sur `lot/u-1b-a` (livraison `b64ca1b`, bis `8fa12ea`, en-tête `28747e0`, C-3 doc `90b891d`). Fusion `--no-ff` sur `lot/etude-suite`.

## Signature investisseur (zone gelée, décision 16)
Objet : `schemas/attested-book.schema.json` sha256 LF **`8ba71122539f3bd928081fe06b7823c06a8265382290040f142a5eea7205c32b`** ; `test/contracts-frozen.manifest.json` sha256 LF **`d50f5c51921dc89dce8bd7996e96ded056a973d34b29e7926fd5a7de33d99066`**. Recomputés par le validateur à quatre révisions et par l'orchestrateur sur l'arbre fusionné (identiques). **Signature investisseur reçue le 2026-09-19, verbatim « go »**, en réponse à la demande explicite portant ce couple de sha (précédent `d5b1bee…` caduc, V-6 (b)).

## Chaîne de preuve
| Maillon | Artefact | Résultat |
|---|---|---|
| Checkpoint-1 plan | ADR-U1b, C-1..C-12 pliées, décisions 20 (A/B), C | approuvé-avec-corrections |
| G1 worker Opus 4.8 max | `b64ca1b` | 336/336, 7/7 mutants rouges, 0 octet sur les 5 schémas gelés, R-25 589 |
| G2 fraîche Opus 4.8 | `docs/G2-lot-u1b-a.md` | APPROUVÉE |
| Checkpoint-2 | `docs/CHECKPOINT2-lot-u1b-a.md` | ACCEPTE-AVEC-CORRECTIONS V-1..V-6 (hors code) ; V-6 tranchée (b) par l'investisseur (décision 33) |
| Bis worker + G2 delta | `docs/G2-delta-lot-u1b-a-bis.md` | CONFORME : `residual.contains = {"const":"no_third_party_verifier"}`, mutants M1/M2 rouges, ajv 9/9 |
| Checkpoint-2 bis | `docs/CHECKPOINT2bis-lot-u1b-a.md` | ACCEPTE-AVEC-CORRECTIONS docs seules (C-1..C-3 pliées) ; objet de signature confirmé |
| G7 orchestrateur | ce fichier | oracle sur l'arbre fusionné : **376/376** (= 365 + 11), lint 0, ratchet 69/69, lang-gate 0, export:check 0 (`F:\tmp\g7-u1b-ci.log`) |

## Fusion
`README.md` auto-fusionné ; aucun conflit ; les 5 schémas gelés antérieurs à 0 octet de différence ; Option A (pas de bump `schema_version`, M001 Déc. 9).

## Régime site : `site[T0]`
Aucune surface servie ne consomme encore `AttestedBook` (tuyaux D7 : `attested_book_roundtrip` et `attested_book_canonical_deterministic` sont des livrables U-1b-b) ; README/roadmap disent « upcoming until served » ; `fleet.ts` inchangé ⇒ rien de déclaré built (CA-11).

## error_origin
V-2 (affirmation d'inexistence du fichier de décisions) et C-1/C-2 (objet de signature périmé, propriétaires manquants) : **orchestrateur**. C-3 (D7 non étiquetée) : rédacteur ADR-U1b. Amendement D2 pré-gel (`description` vide) : rédacteur U1b.

## Items formés
U-1b-b (roundtrip + canonical deterministic, propriétaire orchestrateur, déclencheur : avant H-attested) ; M017 union (propriétaire orchestrateur) ; O non bloquant : titre du garde `contracts-frozen.test.ts:61` cite « ADR-U1b D1 » sans D2ter (laissé).
