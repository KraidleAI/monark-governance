# G7 — U-4b-2a (classe servie `liquidation-eligible-coverage` sur registre VIDE) — ACCEPTED, fusion `88b20d2`

Orchestrateur Fable 5.1 (`claude-fable-5-1`), 2026-09-22 03:23 UTC (`date -u`). Branche `lot/u4b-2a` @ `9ed7707` (G1 `1892144` + sync + pli), fourche `f0720ae`, fusionnée `--no-ff` dans `lot/etude-suite`.

## 1. Oracle complet sur l'arbre FUSIONNÉ `88b20d2` (clés payantes retirées du process)
`npm run ci` → 0 : tests **810 / 809 pass / 0 fail / 1 skip** (`fetch_only_inside_client # until 1b-iii`) ; `lint` 0 ; `lint:ratchet` 0 (69/69) ; `lang:gate` 0 ; `export:check` 0. Logs `F:\tmp\g7-u4b2a\*.log`. R-25 du lot 720 (borne CI 1 205 ; borne interne 1 150).

## 2. Lignée
| Étape | Référence | Résultat |
|---|---|---|
| Plan | `docs/G0-lot-u4b-2.md` (plié ×2 : cp-1 C-1..C-12 + delta D-1..D-11), `docs/CHECKPOINT1-lot-u4b-2.md` (ESCALADE levée par 123), `docs/CHECKPOINT1-DELTA-lot-u4b-2.md` ; décisions 51, 108, 123, 126, 127 ; rulings Q-NEW-1..5 | APPROUVE-AVEC-CORRECTIONS |
| G1 | `F:\tmp\u4b2a\G1-lot-u4b-2a.md` ; 14 fichiers, 794/793/0/1, 12 mutants, R-25 720 | — |
| G2 | `docs/G2-lot-u4b-2a.md` (fusion à blanc 796/795/0/1, 12 + 5 mutants, CA-11 sur les deux surfaces) | PASS-AVEC-CORRECTIONS (C-1 ADR) |
| Checkpoint-2 | `docs/CHECKPOINT2-lot-u4b-2a.md` (12 + 10 mutants, 4 survivants analysés ; C-1 ADR, **C-2 « interval » injecté dans la seule phrase liq servie survivait à la suite complète**) | ACCEPTE-AVEC-CORRECTIONS |
| Pli | `9ed7707` (orchestrateur) : amendement ADR 2a-8 inséré après SCORE-1, tuyaux `:26-27` réécrits (borne haute `built` en -2b ; retrait cascade → U-5/-5b) ; C-2 : deux assertions (`LIQ_EMPTY_REGISTRY_SENTENCE`, `honestyText`) — mutant vérifié ROUGE puis restauré | — |

## 3. Livré
`apps/harness/src/ukemi-strata.ts` (miroir servi de `strateOf` gelé, coupes `[2e11, 1e13, 1e14]`, `liqUpperBoundRegion(ŷ, q̂) = buildIntervalRegion(0, ŷ+q̂)`, q̂ = 0 ⇒ `under_calib`) ; `gate.ts` : classe `liquidation-eligible-coverage` (clé re-dérivée serveur, `predictor_id` client ignoré), texte servi « a conformal upper bound on the liquidable amount… abstains (under_calib) outside it », jamais « interval » (`region.kind` de fil inchangé), refus 400 nommés (α, nMin, classe inconnue = `HarnessToolError`), class-lock BYO ; `calibration.ts` : `hasCommittedCalibrationForClass` + placeholder `UKEMI_LIQ_PREDICTOR_BASE` (conservé, R-26 : inerte sur registre vide, re-pin à -2b) ; `cascade.ts` : étiquette « v0, replaced at U-5 » sur `tools/list` (jamais site/skill/README) ; re-pins h5/openapi/cascade mesurés hors réseau ; 5 fichiers de tests dont `gate-liq-artifact.test.ts` (toutes les lignes `score_a` de la fixture committée, `run` du descripteur + `POST /gate`, n'asserte que `under_calib`).

## 4. Branchement
Chemin servi : MCP `gate` + `POST /gate` via `HARNESS_TOOLS`. En -2a, la classe **n'ajoute aucune revendication** (registre vide) : Ukemi reste `built` (`fleet.ts` inchangé, décision 51) ; aucune nouvelle pièce déclarée `built`. La borne haute servie passe `built` en **-2b** (registre frais après la course -1b, `fleet.ts` re-câblé, surfaces publiques sous 127).

## 5. Items formés
- -2b : re-pin `UKEMI_LIQ_PREDICTOR_BASE` au `meta.cell_a.predictor_id` frais (test 11 du G0 §6 rougit sinon) ; mutants (n') région symétrique contournant le helper et (h') honnêteté keyée client — inobservables sur registre vide, migrés à 2b-4 (cp-2 C-3) ; texte par strate H-3 conservateur / q̂ = max si 100 ≤ n < 199 (126 clauses 1-2) ; clause « which the gate does not check » à porter sur la vitrine (designer v4, point 1).
- Mission-type : borne R-25 citée 1 150 vs CI 1 205 — les deux tenues ; à écrire « 1 150 (interne) / 1 205 (CI) ».

## 6. `error_origin`
C-1 (amendement ADR non inséré) : process (R-20 : rédigé par le worker, insertion orchestrateur — faite au pli). C-2 (trou de couverture « interval » sur la phrase registre-vide) : worker + plan (le mutant (o) du G0 visait `LIQ_COMMITTED_SENTENCE`, pas la phrase réellement servie en -2a) — attrapé par le checkpoint-2 ; le G2 l'avait noté « non bloquant ». R-25 720 vs 480-500 : plan (estimation sous les tests de mutants).

## 7. MAST résiduel
FM-1.3 (dérive de forme : région symétrique réintroduite) couverte par le mutant (n) au helper ; résiduel nommé : (n') au niveau `gate.ts` non observable avant -2b.
