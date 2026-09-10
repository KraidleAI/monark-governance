# G2 — Revue — Lot F-site-5 (How it works)

> Rapport du relecteur G2, **instance séparée à contexte frais ≠ générateur** (AgileGates C-3). Matérialisé au dépôt par l'orchestrateur (correction K-1, patron F-site-8). Verdict G2 : **PASS** (propre, aucune réserve owner-corrigible).

## Gate 0 (R-1) — relecteur
- **Modèle résolu** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` ; pas `claude-opus-5` banni), effort max. **Instance fraîche ≠ générateur.**
- **R-20** : aucun commit/add/reset/checkout/workflow ; git lecture seule ; 3 mutants temporaires restaurés byte-exact (sha avant==après). Périmètre épinglé au commit `0e343ef` (base d8b63c4) ; oracle préliminaire, R-21 orchestrateur re-joué post-rebase.

## Les 6 vérifications adversariales — une preuve chacune
1. **R3b (vocab-gate, critique)** ✓ : les 7 occurrences de `confidence` sous apps/site sont TOUTES dans `no confidence field`, contiguës sur une seule ligne source (porteurs `index.tsx:196` démenti, `page.tsx:63` carte sensors ; casse couverte par le masker `gi`). `maskLine` blanchit par ligne AVANT les patterns. `exemptPhrases` inchangé (aucune nouvelle exemption/garde d'inertie — celle-ci = K-2/F-site-4). `score`/`p_correct` non bannis, rendus en négations honnêtes.
2. **K-4b** ✓ : (i) qualification « An abbreviated, illustrative view… » à côté du JSON (explainer-only, après early-returns board/token). (ii) `gate_sim_json_keys_subset_of_frozen_contracts` **pilote le vrai `gateJson()`** (`push(fresh(),{reading:0.8})` → branche covered, verdict OBJET, non-vacuité par `typeof===object`) : top-level 8/8 ⊆ `GateDecision.properties`, verdict 7 ⊆ 13 `CoverageVerdict.properties`. **Mutant** `p_correct` dans `view` → fail 1 (rouge seul), « gateJson() emits top-level key(s) not in GateDecision: p_correct » ; sim.ts restauré `f7ad2bc8…`. **Distinct de F-site-8 R1** (noms de champs quotés) — pas de duplication.
3. **R2** ✓ : `how_page_rendered_vocab_has_no_numeric_hole` scanne OUTCOMES/REGION_KINDS/REASON_GLOSS au détecteur (scanText) ; complétude **bidirectionnelle** (missing + phantom) ; grille rend le code depuis `loadGateEnums`, jamais un littéral. **Mutants** : numérique « in 3 seconds » → RED `["3"]` ; `ghost_reason` (sans chiffre) → RED « gloss for a non-existent reason code: ghost_reason ». how-copy.ts restauré `ed154611…`.
4. **K-4a** ✓ : `controls.tsx` rétablit « Classification task, label schema `up|down`. » (design L171).
5. **Honnêteté** ✓ : test 44 vert ; `abstain` (∈ CoverageVerdict) **jamais littéral** (rendu `actions[ACTION_ABSTAIN]`) ; **aucun contrat inventé** — `AttestedDoc`/`AttestedFlow` du design pipeline absents de `schemas/` → NON inventés, la carte sensors rend le seul `AttestedPrice` gelé ; 0 mot proscrit ; anglais 0 ; jamais `live` (1 occurrence = commentaire, sens verbal).
6. **Fidélité design** ✓ : explainer monté, pipeline 4-contrats (titres + `required[]` chargés), region set/interval/budget, grille 13 raisons, one-plug, limits.

## Oracle (R-21 orchestrateur, post-rebase — à confirmer sur main final)
`npm run ci` (105/105 sur base d8b63c4 ; sera recompté post-rebase) ; `lint` 0 ; `lint:ratchet` 92/92 ; `next build` 0 (`/how` static) ; `lang-gate --scope site` 0 ; `grep-forbidden` 0 ; `git diff main -- schemas/ packages/` 0 octet ; sim.ts byte-exact `f7ad2bc8…` ; **R-25 501** < 1205.

## Verdict
**G2 — PASS.** R3b (démenti via phrase exemptée, 0 nouvelle exemption), K-4a/K-4b (gate JSON piloté + mutant), R2 (bidirectionnel + 2 mutants), honnêteté et fidélité tous verts. Aucune réserve owner-corrigible. G7 + error_origin + validateur = orchestrateur.

## Addendum checkpoint-2 (orchestrateur, 2026-09-10)
- **K-5 / K-6** (durcissements de gate dus historiquement à F-site-5 mais hors prompt du build) : **re-assignés au micro-lot gate-refinement post-vitrine (PLAN §9)** avec les R1/R2 de F-site-4 — le contenu de F-site-5 est honnête et gate-vert ; K-5/K-6 durcissent, ne corrigent aucune fausseté vivante. Non dette nue (owner nommé, correction + source).
- **error_origin (G7)** : un incident de procédure est consigné (G1 §choix, preuve mutant-3 R2 d'abord confondue — `git checkout` sur un fichier NON suivi ne restaure pas, le `ghost_reason` s'était empilé sur un « 3 seconds » résiduel) → **origine = procédure worker**, auto-détecté par le worker, re-joué en isolé (backup scratchpad → sha restauré), **corrigé avant la revue G2, aucun défaut livré**. Leçon consignée : pour un fichier non commité, l'oracle de restauration est le **sha256**, jamais `git checkout`. (Corrige le « n/a » initial — checkpoint-2 C2.)
- Ligne journal campagne F-site-5 → PR de gouvernance (rattrapage), avec cet `error_origin`.
