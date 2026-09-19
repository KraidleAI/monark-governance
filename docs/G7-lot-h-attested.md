# G7 — lot H-attested (étape 7 `attested-gate` de la trace h5, ADR-EC E1/C-7) — VERDICT : ACCEPTÉ, FUSIONNÉ
Orchestrateur `claude-fable-5-1`, 2026-09-19. Gel `95a360f` sur `lot/h-attested` (code `a7d9c6b`, COR-1 doc `95a360f` ; base `c89c1d9`). Fusion `--no-ff` sur `lot/etude-suite`.

## Chaîne de preuve
| Maillon | Artefact | Résultat |
|---|---|---|
| Checkpoint-1 plan | `docs/G0-lot-h-attested.md` (+ C-1..C-6) | approuvé-avec-corrections, pliées avant le worker |
| G1 worker Opus 4.8 max | `docs/PLI-lot-h-attested.md` | 377/377, 9 mutants rouges, trace re-pinnée `4ca37d5c…` (21 859 o), R-25 136 |
| G2 fraîche Opus 4.8 | `docs/G2-lot-h-attested.md` | APPROUVÉ-AVEC-CORRECTIONS (COR-1 item fantôme, plié) ; 11/11 mutants tués ; trace régénérée byte-identique |
| Checkpoint-2 validateur | `docs/CHECKPOINT2-lot-h-attested.md` | ACCEPTE ; Own-V (`remaining_budget`) ajouté et rouge ; forme MCP remesurée |
| G7 orchestrateur | ce fichier | oracle sur l'arbre fusionné : **377/377**, lint 0, ratchet 69/69, lang-gate 0, export:check 0 (`F:\tmp\g7-hatt-ci.log`) ; fusion auto sans conflit |

## Ce que le lot prouve
Sur le fil JSON-RPC réel (in-process, pas `tool.run()`), l'outil `gate` consomme l'`AttestedPrice` vive rendue par `attest` : `verdict.residual` = `attested.residual` (3 atomes), et la réponse est byte-identique à l'étape 5 hors ce champ. Le mutant « couture retirée » rougit (a) : la trace traverse `gate.ts:613`. Un sujet hors table est refusé sur le fil en HTTP 200 / `isError:true` sans `structuredContent` (le 400 n'existe que sur le miroir HTTP) — forme mesurée par le worker, G2 et le validateur.

## Branchement (CA-11)
Pas de pièce nouvelle : la prise `attested` du gate servi était déjà built · served ; ce lot en livre la preuve d'intégration non-LLM (`h5_carries_attested`) et l'artefact rejoué par CI. ADR-EC Tuyaux l.44 : livré. Item M017 Tuyaux (étape h5 portant `attested`) clos ; test (3) préexistant inchangé. `fleet.ts` identique ; aucune surface publique.

## Pliés au G7
N-1 : G0 amendement C-1 `gate.ts:120` → `:117` (`error_origin` validateur). Journal de provenance ; CHANTIERS.

## error_origin
COR-1 (item fantôme PLI) : worker. N-1 : validateur. Aucune erreur de code.

## Items formés
Commentaire `test/h5-e2e-probe.test.ts` l.210 « of step 7 » → étape 6 (déclencheur : prochaine passe touchant ce test) ; en-tête `scripts/lang-gate.mjs` « global is RED by design » périmé (déclencheur : prochaine passe `scripts/`) ; hors lot déjà formés : U-4 union `AttestedPrice | AttestedBook`, K-1, BYO + `attested`, liaison temporelle.
