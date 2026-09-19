# CHECKPOINT-2 (LIVRABLE) — lot H-attested, gel `95a360f` (`lot/h-attested`, code `a7d9c6b`, base `c89c1d9`)
Validateur-humain `claude-fable-5-1` (instance séparée, contexte frais), 2026-09-19 ; rejeux sous `F:\tmp\cp2-hatt\` (AM-2 ter : `copy/` = `git archive`, `clone/` sans hardlinks pour les `merge-tree`, `m3-probe.mjs`) ; persisté par l'orchestrateur. **Décision : ACCEPTE** (1 item doc N-1, 3 notes).

## Rejoué par le validateur
1. **Trace** régénérée par le builder sur la copie = byte-identique à la committée (`cmp` silencieux) ; sha LF `4ca37d5c731f33edb17b2cbe986a2bd7007df6371d1edf0b9352be70db8075f1`, 21 859 o ; pin aux trois lieux (PROVENANCE l.65 nom + sha même ligne) ; ligne 292 = URL Binance BTCUSDT.
2. **Oracle** : 377/377, lint 0, ratchet 69/69, lang-gate 0, export:check 0, gate:vocab 0.
3. **C-1..C-6 du checkpoint-1** : note de l'étape 7 = `GATE_NON_REVERIFICATION_SENTENCE` (gate.ts:117-119) octet pour octet + phrase résidu ; (e) `carried == price` vrai et discriminant (M6'-iso ne rougit que (e)) ; (a') 3 résidus ; (b) sur la `response` entière moins `verdict.residual` ; ordre des clés top-level inchangé, hunks après l'étape 6 seulement ; PROVENANCE « five `tools/call` » + chaîne + sha/octets ; forme MCP remesurée par probe : **HTTP 200, `text/event-stream`, pas de membre `error`, `result.isError:true`, pas de `structuredContent`** ; champ `observed` (`attested_gate_action: "commit"`, 3 résidus).
4. **Mutants** (restauration sha-exacte) : M1 couture retirée ⇒ (a) rouge — le discriminateur qui prouve que la trace vive traverse `gate.ts:613` ; M3 ⇒ TypeError ⇒ faithfulness rouge ; M6'-iso ⇒ (e) seule ; Own-2 ⇒ (c) ; **Own-V** (validateur : `remaining_budget` +0,01 quand `attested` présent) ⇒ (b) rouge — champ non couvert par PLI/G2.
5. **R-25** 136 ≤ 400 ; `merge-tree` (clone) contre `lot/etude-suite` `f36d1f6` et contre `lot/u-1b-b` `04d45d4` : 0 conflit dans les deux ordres ; intersection des fichiers des deux lots = ∅.
6. **CA-11** : chemin servi = outil MCP `gate` avec la prise `attested` (déjà built · served) ; `h5_carries_attested` = test d'intégration non-LLM sur JSON-RPC réel in-process ; trace committée = artefact rejoué par CI ; ADR-EC l.44 quatre éléments déclarés ; item Tuyaux M017 clos ; `fleet.ts` blob identique ; rien de « built » nouveau.
7. **Zone gelée** : zéro octet dans `packages/hikae`, `packages/contracts`, `schemas/`, `apps/harness/src`, `scripts/`.

## Checklist
CA-1..CA-3 conformes · CA-4/5 n-a · CA-6 conforme · CA-7 conforme (COR-1 retirée, item `lang-gate.mjs` formé) · CA-8 conforme · CA-9 conforme (tout ré-exécuté) · CA-10 conforme · CA-11 conforme.

## Pour le G7
- **N-1 (doc, `error_origin` validateur)** : G0 amendement C-1 citait `gate.ts:120`, réel `:117` — plié au G7.
- Note 1 : commentaire test l.210 « of step 7 » alors que (c) lit le sujet de l'étape 6 ; couverture exacte via (e) ; à plier à la prochaine passe touchant ce test (rouvrir `test/` pour un commentaire serait disproportionné).
- Note 2 : transcriptions G2 (hunk `380a484` → mesuré `382a487,492` ; `merge-tree` contre `2e07fa6` → remesuré contre `f36d1f6`), non contradictoires.
- Note 3 : `observed.attested_gate_*` asserté par la seule byte-identité (1) — conforme à C-5 (présence).

## Preuve d'innocuité
`git status --porcelain` vide avant/après sur `F:\Monark` (`f36d1f6`) et `F:\Monark-wt-hatt` (`95a360f`) ; `count-objects` identique ; sha des 6 livrables = PLI. AM-1 : attrapé Own-V, forme MCP remesurée, intersection depuis les merge-bases, `merge-tree` contre la HEAD courante ; manqué : une citation de ligne non revérifiée dans mon propre amendement (N-1).
