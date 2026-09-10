# G2 — Revue — Lot H1 (harnais MCP · outil `gate` HIKAE)

> Rapport du relecteur G2, **instance séparée à contexte frais ≠ générateur** (AgileGates C-3). Matérialisé au dépôt par l'orchestrateur au merge. **Verdict G2 : PASS-AVEC-RÉSERVES — aucune réserve bloquante.**

## Gate 0 (R-1) — relecteur
- **Modèle résolu** : `claude-opus-4-8[1m]`, effort max. **Instance fraîche ≠ générateur.**
- **R-20** : lecture seule ; toute mutation restaurée par backup pristine + assertion **sha256** (jamais `git checkout` — `apps/harness` untracked). Manifest sha256 de l'arbre entier (19 fichiers) identique avant/après ; `git status --short` inchangé ; ancre `server.ts` sha `f0f4e762…0107b09e` (arbre testé confirmé).

## Les 7 points — une preuve chacun
1. **Oracle indépendant** ✓ : `npm run ci` 121/121 ; lint 0 ; ratchet 92/92 ; `lang-gate --scope harness` 0 ; `grep-forbidden` 97 fichiers 0 ; `git diff main -- schemas/ packages/contracts/` **0 octet** (+ `git diff --stat main -- packages/` vide : HIKAE/contracts réels, non modifiés) ; R-25 **1065 < 1205**.
2. **Non-vacuité des portes harness** ✓ : FR injecté → `lang-gate --scope harness` 8 hits exit 1 ; `confidence` injecté → `grep-forbidden` (scope `scan.harness`) exit 1 ; `anti-hallucination` injecté → grep GLOBAL exit 1. Tous restaurés sha.
3. **13 mutants exécutés (relecteur), tous rouges + restaurés byte-exact (sha256 avant==après), les 12 tests nommés couverts.** Clean 12/12 rejoué sur l'arbre restauré (`pass 12 / fail 0 / skipped 0 / todo 0`).

| id | cible | mutation | assertion/erreur qui tue | test nommé |
|---|---|---|---|---|
| M1 | gate.ts | `{...gate(gateInput), p_correct:0.9}` | `MONARK unknown key 'p_correct'` (assertClosedGateDecision, D9) | gate_tool_emits_frozen_gate_decision |
| M2 | gate.ts | dispatch `TASK_BTC_DIR \|\| true` | `HarnessToolError: … expects a string yhat` | gate_dispatches_on_task_class |
| M3 | gate.ts | `nCalib = params.nMin` | `reason: +'intent_not_in_region' -'under_calib'` | gate_dispatches (discriminateur) |
| M4 | registry.ts | `import "node:fs"` | `side effect …registry.ts: node fs import` | mcp_tools_have_no_side_effects |
| M5 | server.ts | `isHarnessOriginAllowed → true` | `a present, non-allowlisted Origin must be rejected` | origin_invalid_returns_403 |
| M6 | server.ts | absent `→ false` | `an absent Origin is accepted` | origin_absent_is_accepted |
| M7 | calibration.ts | `seed → seed+1` | throw import `digest drift — ee9accbc… != fcebed27…` | calibration_declared_synthetic (fail-closed) |
| M8 | gate.ts | appelle `globalThis[params.tool]()` | `the gate must NEVER invoke the named tool (D0)` | gate_tool_never_calls_tool |
| M9 | schema-projection.ts | `stripMeta` saute `required` | `prediction.required must match the frozen file` | tool_schema_equals_frozen_schema |
| M10 | gate.ts | remplace la phrase cascade | `…includes("no cascade calibration is committed")` faux | gate_description_declares_cascade_uncalibrated |
| M11 | gate.ts | supprime la borne `alpha∈(0,1)` | `Missing expected exception (HarnessToolError)` | gate_rejects_invalid_params |
| M12 | server.ts | `HOST = "0.0.0.0"` | `+'0.0.0.0' -'127.0.0.1'` | harness_binds_localhost_only |
| M13 | gate.ts | `confidence` dans la description | in-process scan → `banned vocab … (ADR-M005 D9)` | harness_tool_descriptions_pass_vocab |

sha de restauration (post-campagne) : gate.ts `60d0e50b…`, registry.ts `2f30ba51…`, server.ts `f0f4e762…`, calibration.ts `ec6e8321…`, schema-projection.ts `e9b18b14…` — tous == pré-mutation.
**Ajout checkpoint-2 (C-1/C-2)** : `tool_schema_equals_frozen_schema` durci d'une assertion « aucune annotation `description`/`title` sur les sous-arbres gelés » (mutant : strip d'annotation désactivé ⇒ les descriptions FR/RR-1 réapparaissent ⇒ rouge) ; `origin_invalid_returns_403` étendu au **chemin HTTP réel** + assertion de corps `error==="invalid_origin"` (mutant : `originGuard` retiré de `handleNodeRequest` ⇒ requête evil → 400 ≠ 403 ⇒ rouge). **Relecture G2 ciblée tour-3 (instance fraîche ≠ générateur, modèle `claude-opus-4-8[1m]`) : PASS-AVEC-RÉSERVES, 0 bloquante** — les 2 mutants tués par leur assertion intentionnelle, params anglais intacts, ci 121/121, gelé 0 octet, restaurations sha256 ; 3 dérives de commentaire (RES-1/2/3) disposées par l'orchestrateur.
4. **Honnêteté de fond** ✓ : (a) calibration **réellement dérivée des fixtures S2a synthétiques** (digest re-dérivé indépendamment == `fcebed27…` ; mutant seed+1 → throw import « digest drift ») ; (b) cascade `under_calib` **calculé** par l3-gate:79 (mutant `nCalib:=nMin` change la raison → non copié) ; (c) sonde `runGate` : décision ⊆ 8 clés gelées, `verdict.scores===undefined`, JSON sans `p_correct/confidence/certainty` ; (d) **sonde wire MCP** `tools/list` + `deepStrictEqual` vs strip indépendant : `additionalProperties:false` aux 5 niveaux, **deep-equal prediction ET outputSchema PASS** (le contrat clos est exposé au client) ; (e) `gate` pur, ne lit jamais `input.tool` (mutant M8 rouge).
5. **Non-régression des gates** ✓ : `tsc --listFilesOnly` → 9 fichiers harness dans le programme TS ; bascule eslint `apps/**`→`apps/site/**` (harness type-checked, site encore linté) prouvée par 3 injections `any` (ratchet 93/92, harness src, site how/page.tsx).
6. **Dette / R-13** ✓ : aucun `TODO`/`FIXME` ; `GateDecision` = 8 clés gelées, **aucune enveloppe d'honnêteté dans un contrat clos** (label/provenance en `content` texte + description + `BTC_DIR_CALIB_PROVENANCE`, hors schéma).
7. **AgileCoder 3 étapes** ✓ : plan respecté (K/C/D8, SDK 2.0.0) ; code correct (compose HIKAE non modifié, pur, cascade honnête) ; tests pertinents (chaque nommé tué, 0 skip/todo).

## Réserves (aucune bloquante) — disposées par l'orchestrateur
- **R1 (non-bloquante, error_origin=spec)** : `mcp_tools_have_no_side_effects` assertait `REGISTERED ⊆ {attest,gate,cascade} + gate présent`, alors qu'ADR-M005 D9 écrit le littéral `=== {attest,gate,cascade}` (état terminal). Registre livré = exactement `["gate"]` → **aucune violation vivante**. **DISPOSÉE (orchestrateur)** : assertion **exacte par-lot** ajoutée — `deepEqual([...REGISTERED].sort(), ["gate"])` (l'allowlist ⊆ conservée en défense) ; un enregistrement prématuré d'`attest`/`cascade` en H1 rougit désormais. La sémantique par-lot construit vers le set terminal, sans contredire D9. Oracle re-passé vert.
- **O1 (observation, error_origin=spec)** : `schema.test.ts` comparait `required` + jeu de clés + `additionalProperties:false` (la propriété deep-equal complète étant établie par la sonde wire du G2). **DURCIE (orchestrateur)** : parité de **valeur complète** ajoutée — `deepEqual` des `properties` de prediction, du verdict déréférencé (vs CoverageVerdict gelée) et des champs non-verdict de GateDecision. Oracle re-passé vert.
- **O2 (observation, error_origin=process)** : `docs/G1-lot-H1.md`/`G2-lot-H1.md` matérialisés au merge par l'orchestrateur (ce document + G1) — attendu, pas une dette.

## Verdict
**G2 — PASS.** Les 5 conditions bloquantes toutes négatives (oracle rouge / diff gelé ≠ 0 / mutant survivant / porte vacueuse / perte d'`additionalProperties:false` au wire). R1 disposée par durcissement de test, O1 durcie, O2 matérialisée. Recommandation à G7/R-21 : PASS.

## G7 (orchestrateur) + error_origin
- **R-21** : oracle ré-exécuté par l'orchestrateur sur l'arbre final (post-R1/O1) — **ci 121/121, lint 0, ratchet 92/92, lang-gate harness 0, grep 0, frozen 0 octet, R-25 1065 < 1205**. Adjudication préalable indépendante confirmée (frozen invariant + non-vacuité harness prouvée par mutant orchestrateur, `server.ts` restauré byte-exact).
- **error_origin** : R1/O1 = **spec** (lettre de l'ADR vs sémantique par-lot ; test de dérive perfectible) — disposés avant merge, aucun défaut vivant. Incident de restauration `server.ts` = **procédure orchestrateur** (chemin I/O relatif) — auto-détecté, corrigé byte-exact, aucun défaut livré. Écart SDK = résolu (R-8). Aucune dette nue.
- **G7 CLOS** — merge autorisé (siège committeur `claude-opus-4-8` par exception Opus-seat) sous réserve de l'acceptation checkpoint-2 (CA-6, par lot).
