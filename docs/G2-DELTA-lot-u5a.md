# G2-DELTA U-5a (1b00d16) — PASS

G2-DELTA.md patché (M-1 mesuré, D-2, contraste V5, verdict affiné). État final déjà confirmé : HEAD `1b00d16`, arbre tracké propre. Rendu court ci-dessous (durable dans `F:\tmp\g2-u5a\G2-DELTA.md`).

---

Modèle résolu : claude-opus-4-8[1m]

# G2-DELTA — lot U-5a @ `1b00d16` — VERDICT : **PASS**

Reprise même clone : `git fetch` + `checkout 1b00d16` (parent `fc2e732`). A-7 env -u des 8 clés sur tout. Producteur `adapter-book.ts` inchangé vs fc2e732 (sha `9f83de57…`) ; delta = 5 fichiers.

**Les 6 points reproduits :**
1. **A-9** : `u5_served_phrases_have_no_surclaim` vert (absence de `interval`/`verified` nu/`%`/`probability` hors « never a probability », sur label + `ukemiPredictHonestyText()` + `UKEMI_PREDICT_TOOL_DESCRIPTION`) ; injection `a9-label-injection` (« verified: 95% probability … interval ») **ROUGE (KILLED)**.
2. **Oracle B refus == census gelé** (rejeu indépendant) : **non_mono_weth 6611 / emode_out_of_range 33 / no_collateral 0 / crossed 563 / noCross 8889** — exact. Oracle A 565/565 bigint-exact ; inCell 565/565 ; 0 faux positif.
3. **ŷ>2^53 ⇒ 400** : `u5_tool_refuses_yhat_over_safe_integer` vert, garde consolidée en UNE garde tuable, `safe-integer-guard-removed` ROUGE. **predictor_id lié** : `=== ${UKEMI_LIQ_PREDICTOR_BASE}/s${strate}` asserté, `predictor-id-not-bound` ROUGE.
4. **Mutants** : mes 5 (2 KILLED, 3 équivalents — 2/3 déclarés ADR item 3, cf. D-2) ; **worker 18/18 KILLED** byte-exact ; **validateur 11** re-ciblés = 9 KILLED + 2 survivants attendus. Décisif : **V4 (nonmono→yhat0) et V9 (predictor_id), survivants PRÉ-pli, sont maintenant KILLED** (C-3 census / C-6 binding — le pli ferme les deux trous). V5 survit à l'ANCIEN test présence-seule mais la même injection MEURT contre le NOUVEAU test (a9-label-injection) ; V7 survit en -5a (rien ne route ukemi-predict ; fil TOOL_ERROR_NAMES = item -5b, C-5).
5. **Oracle env -u** : `npm test` = **883/882/0/1** (skip = `u4b_labels_replay_via_main_real_artifact`, préexistant) ; typecheck/gate:vocab/lint/lang:gate/export:check = 0 ; ratchet 69/69. **Fusion à blanc → voir M-1.**
6. **ADR** (`docs/adr/ADR-U5a-producteur-ukemi-predict.md`) : provenance corrigée (« orchestrator ruling 2026-09-22 14:48 UTC applying investor decisions 51/123, error_origin orchestrator » ; plus de « the investor chose ») ; **aucun renvoi F:\tmp dans l'ADR** (les seuls F:\tmp restent dans `G0-lot-u5.DRAFT.md`, provenance du brouillon) ; item C-G2-1 présent ; note de supersession en tête du G0 DRAFT.

**R-25 (borne vérifiée)** : pathspec verbatim `ci.yml:65`, trois-points vs `1f4b746` = **CHANGED 1146 < 1150** (marge 4 ; 11 fichiers ; les 2 docs neufs + fixture `.json` exclus).

**Invariants** : frozen `u4b-scores.mjs` `2f9a31f6…` (avant/après) ; `schemas/*` + `contracts/types.ts` hors diff ; `ALLOWED_TOOL_NAMES` = 4 (ukemi-predict absent, set-exact vert) ; aucun gelé/GELÉ-par-escalade touché ; sha des 4 fichiers mutés byte-exact restaurés ; arbre tracké propre, HEAD `1b00d16`.

**Deux items NON bloquants (aucun n'est un défaut de code U-5a) :**
- **M-1 (action de fusion, orchestrateur)** : la prémisse « docs seuls » est périmée — `origin/lot/etude-suite` a avancé `3a9c1f5..aefb071` (relevé au fetch), le G7 u4b-1b-2 y a fusionné du code + touché `export-exclude-tests.json`. La fusion à blanc donne **1 conflit**, sur ce seul fichier : **union trivial** (U-5a ajoute `ukemi-producer-oracle.test.ts` ; etude-suite ajoute 3 entrées ; préfixe commun intact, aucune entrée U-5a perdue). **Union MESURÉE par moi** (staged dans `--no-commit`, jamais commitée, puis `--abort` — R-20) : `typecheck=0`, `export:check=0`, `ukemi-producer-oracle`+`ukemi-predict`+`harness_export_whitelisted` = **14/14 verts**. Action au pli : rebaser U-5a sur lot/etude-suite courant OU unioner ce fichier (résolution prouvée verte).
- **D-2 (documentaire mineur)** : l'ADR item 3 déclare 2 de mes 3 mutants équivalents (`hf<`/`<=`, `strateOf(ŷ±1)`) mais omet `sort-no-tiebreak` (équivalent : chemin oracle pré-trié [VÉRIFIÉ presorted=true, 3 collisions de blocs] + tri V8 stable ; producteur correct/défensif). À ajouter à l'item 3 pour zéro-dette.

**Fichiers (chemins absolus)** : rendu durable `F:\tmp\g2-u5a\G2-DELTA.md` ; G2 initial `F:\tmp\g2-u5a\G2.md` ; clone `F:\tmp\g2-u5a\` @ `1b00d16` ; instruments scratchpad `F:\tmp\claude\F--Monark\7a32969b-9ec3-45d5-8e36-f5466c58bb38\scratchpad\{mutants-g2-own.mjs, cp2-mutants-retargeted.mjs, test-delta.log}`.
