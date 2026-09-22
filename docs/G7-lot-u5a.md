# G7 — U-5a (producteur pur `fromRealizedBook` + module `ukemi-predict` non enregistré, option B) — ACCEPTED, fusion `a050f75`

Orchestrateur Fable 5.1, 2026-09-22 17:08 UTC (`date -u`). Branche `lot/u5a` @ `1b00d16` (G1 `fc2e732` + pli), fourche `1f4b746`, fusionnée `--no-ff` avec UNE union (`scripts/export-exclude-tests.json` : 13 entrées, prouvée verte par G2-delta et re-checkpoint-2). ADR-U5a complété (D-2) au commit suivant.

## 1. Oracle sur l'arbre FUSIONNÉ (clés retirées du process)
`npm run ci` → 0 : **917 / 917 / 0 / 0** ; lint 0 ; ratchet 69/69 ; lang:gate 0 ; export:check 0. `ALLOWED_TOOL_NAMES` = 4 outils inchangés (décisions 51/123) ; `u4b-scores.mjs` `2f9a31f6…` intact ; aucun fichier gelé par l'escalade touché. R-25 1 146.

## 2. Lignée
Décision 132 (rulings Q-U5-0..11) → checkpoint-1 `docs/CHECKPOINT1-lot-u5a.md` (ESCALADE tranchée par 51/123 : option B, 4 outils ; C-1..C-8) → G1 `docs/G1-lot-u5a.md` (Oracle A 565/565, Oracle B 16 096, 15 mutants) → G2 `docs/G2-lot-u5a.md` PASS-AVEC-CORRECTIONS → checkpoint-2 `docs/CHECKPOINT2-lot-u5a.md` ACCEPTE-AVEC-CORRECTIONS (récidive A-9 sur le label : injection survivante) → pli `1b00d16` (18 mutants, A-9 asserté par absence, refus == census, predictor_id lié, ADR dans le dépôt) → G2-delta `docs/G2-DELTA-lot-u5a.md` PASS → re-checkpoint-2 `docs/CHECKPOINT2-DELTA-lot-u5a.md` ACCEPTE-AVEC-CORRECTIONS (union à la fusion).

## 3. Livré / branchement
`packages/monark/src/adapter-book.ts` : `fromRealizedBook(book, params)` pur (K-8), règle close-factor gelée ré-implémentée sans I/O, refus nommés ; `apps/harness/src/tools/ukemi-predict.ts` : module complet (enveloppe K-1, 400 nommés, v3.5.0 fail-closed, ŷ:0 servie, phrases sans surclaim) **NON enregistré** ; composition prouvée `runUkemiPredict → runGate` (under_calib à HEAD) + liage A-10. Statut public : `upcoming` partout (aucun registre ne dit built).

## 4. Items (déclencheur = fusion -2b / U-5b)
U-5b = enregistrement + route + retrait `cascade` 4→4 + re-pin h5 + `verify-harness.mjs:32` + skill/MCP/README/site (même fusion, décisions 51/127) ; 123(ii) rejeu Oracle A sur le JSONL frais ; non-vacuité « ŷ varié ⇒ décision varie » ; A-9-OUTILLÉ ; trois mutants équivalents déclarés.

## 5. `error_origin`
Fenêtre « 5 outils » : orchestrateur (décision 132 contre 51/123 — attrapé au cp-1) ; A-9 présence-seule : worker (attrapé au cp-2) ; conflit d'exclusion : plan (fusion parallèle).
