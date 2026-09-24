# G7 — lots U-1a-hard + U-1a-hard-2 + pli U-1a-hard-3 (Ukemi recorder durci) — VERDICT : ACCEPTÉ, FUSIONNÉ
Orchestrateur `claude-fable-5-1`, 2026-09-19. Gel `bac4a15` sur `lot/u-1a-hard-2` (contient U-1a-hard `e8bcfe4`, jamais fusionné seul — G2 O-2 : fusion unique). Fusion `--no-ff` sur `lot/etude-suite`.

## Chaîne de preuve
| Maillon | Artefact | Résultat |
|---|---|---|
| U-1a-hard G1/G2/checkpoint-2 | `docs/G2-lot-u1a-hard.md`, `docs/CHECKPOINT2-lot-u1a-hard.md` | ACCEPTE-AVEC-CORRECTIONS → V-1 (a)-(f) = lot U-1a-hard-2 |
| U-1a-hard-2 G1 + G2 fraîche + fold | `docs/G2-lot-u1a-hard-2.md` (gel `1d286f0`) | 343/343, 13 mutants rouges |
| Checkpoint-2 U-1a-hard-2 | `docs/CHECKPOINT2-lot-u1a-hard-2.md` | ACCEPTE-AVEC-CORRECTIONS : V-1 test O-1 non cappé (paire 120,4 s sous R2), V-2 doc, V-3 invariants CI non verrouillés |
| Pli U-1a-hard-3 worker | `docs/PLI-U-1a-hard-3.md` (gel `bac4a15`) | V-1 stub-succès + cap, V-E call-site réseau, V-3 test racine ; sources byte-identiques |
| Checkpoint-2 bis | `docs/CHECKPOINT2bis-lot-u1a-hard-2.md` | ACCEPTE : R2 10,3 s ×2, V-E spécifique, 5 mutants V-3 rouges, 345/345, arbre fusionné 365/365, R-25 648 |
| G7 orchestrateur | ce fichier | oracle rejoué sur l'arbre fusionné : **365/365**, lint 0, ratchet 69/69, lang-gate 0, export:check 0 (`F:\tmp\g7-u1ahard-ci.log`) |

## Fusion
Aucun conflit (`test/ci-gates.test.ts` auto-fusionné = 25 tests ; `ci.yml` = 5 `timeout-minutes` niveau job + ligne `STAT=` UNION déjà en place). R-25 sous la STAT fusionnée : 648 ≤ 1 205, fusion unique.

## Branchement (CA-11)
Recorder Ukemi `upcoming` : aucun import de `ukemi/record` hors `apps/sentinel/{src/ukemi,test}` ; `fleet.ts` sans entrée recorder ; chemin servi = U-6 (ADR-EC Tuyaux l.45). Rien de déclaré built.

## error_origin (assignés, V-4)
- CLI `main()` no-op Windows (U-1a-hard, cause du wrapper non committé) : **générateur** (garde `import.meta.url === argv[1]` non testée cross-plateforme), co-origine **orchestrateur** (mission sans oracle CLI officiel hors ligne — règle §F ajoutée depuis).
- Régression V-1 U-1a-hard-2 (test tests-seuls sans re-mesure R2) : générateur ; secondaire orchestrateur (pli accepté sans G2 delta) — règle §F « tests-seuls n'est pas sans risque » ajoutée.
- G2 annotation `G2-lot-u1a-hard.md:131` (12 s / inguardable) : orchestrateur, consignée.
- Survivants déclarés non bloquants : V-C (snippet non verrouillé `record.ts:86`), V-D (txHash non minusculé `rpc2.ts:84`) — items formés, déclencheur : prochain pli touchant `record.ts`/`rpc2.ts`.

## Items formés
§F-1 (cas (c) `classifies_rpc_errors` en stub-succès à `retries+1`, cap conservé ; déclencheur : tout nouveau test cap-seul sur la paire ou prochain pli `ukemi.test.ts`) ; V-C, V-D ; U-6 chemin servi (H-attested / K-1) ; notes de release (retry live sous charge, book plein deploy→B, forme inédite `isRpcRevert`, digests bornés = sous-ensembles).
