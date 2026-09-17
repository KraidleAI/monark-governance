# G1 — Lot ADR-M011 (garde NDG-1) — rapport verbatim du générateur

> Instance générateur : `worker` **`claude-opus-4-8[1m]`**, agentId `afb3de98`. R-1 : préfixe vérifié par l'orchestrateur avant consommation. Persisté sur correction C-1 du checkpoint-2 (2026-09-17). Texte = sortie de l'agent, verbatim (sections 1–9).

---

## 1. Modèle résolu
`claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` — worker Opus 4.8 épinglé, effort max).

## 2. Fichiers modifiés / créés
**Logique :** `packages/hikae/src/region.ts:60-65` NDG-1 (D3a) `if (lo === hi) return { abstain:true, reason:"under_calib" }` après le throw M5 (message byte-identique) ; en-tête 1-13 réécrit. `packages/hikae/src/l3-gate.ts:88` D6(b) `nCalib < nMin || input.verdict.reason === "under_calib"` ; `:123` D3(b) `if (region.lo >= region.hi)` première ligne de `decideInterval` ; en-tête 2-31 + JSDoc 112-117.
**Commentaires seuls :** `interval-conformer.ts:10-12, :86` ; `apps/harness/src/tools/gate.ts:271-272`.
**Cross-refs :** `ADR-M002:143` (D5), `:224` (D9/C4) ; `ADR-M007:60`.
**Tests :** `packages/hikae/test/interval-nondegenerate.test.ts` (créé, 6 tests : §3.1 vecteur 190 zéros + 1 dust 1.2e-8 à α=0.10 épinglé + tous-nuls + contrôle négatif α=0.01 + anti-circularité `splitQuantile⇒{qhat:0}` ; §3.2 hand-built ; §3.3 unitaire ; §3.4 non-régression) ; `region-predictor.test.ts:14-27` test 15 flip ; `apps/harness/test/gate.test.ts:22, :402-457` §3.6 byoVerdict + §3.3 discriminateur D1.

## 3. Périmètre
`l1-split.ts`, `packages/contracts/**`, `schemas/*.json` absents du diff. `git status --porcelain` : 9 M (gate.ts, gate.test.ts, ADR-M002, ADR-M007, ADR-M008, interval-conformer.ts, l3-gate.ts, region.ts, region-predictor.test.ts) + ?? (PLAN-m008-f2b-usde.md, ADR-M011, interval-nondegenerate.test.ts). ADR-M008 / PLAN : non touchés par moi. *(Correction orchestrateur : ces deux fichiers viennent du lot F2-B concurrent, arrivés après le snapshot de session — pas « dans le snapshot » comme écrit ; exclus du commit M011.)*

## 4. Tests
`npm test` → **212 pass / 0 fail** (baseline 204 + 8). Par package : root 51, contracts 45, hikae 29, monark 22, ukemi 8, atelier 5, harness 52.

## 5. Mutants M1–M4 (restauration Edit + sha bracketing)
Refs : region `1a1a2d3d`, l3-gate `c23a4030`, interval-conformer `78796dae`, gate `9f23228f`.
- **M1** retrait `lo===hi` → 6 rouges (§3.1, all-zeros, §3.3u, test 15, §3.6 `verdict.reason` `'covered'`, §3.3h) → restauré ✓.
- **M2** retrait `lo>=hi` → 1 rouge (§3.2, `d.action` `'commit'`) ; §3.6/§3.3h restent verts → restauré ✓.
- **M3** `lo===hi`→`q̂>0` (+ `q̂===0` dans les 2 producteurs) → 3 rouges (§3.3-byoVerdict `'covered'`, §3.3u, test 15) / **verts-preuve** §3.1, all-zeros, §3.6, real-interval (q̂>0 rate l'absorption ⇒ D1 non-redondant) → restauré ✓.
- **M4** retrait `|| verdict.reason==="under_calib"` → 2 rouges (§3.6 `d.reason` `'intent_not_in_region'`, §3.3h) → restauré ✓.

**Incident (R-21)** : lors de la re-capture M1, restauration de `region.ts` par `git checkout` ⇒ retour HEAD, correctif détruit ; détecté immédiatement, 3 edits réappliqués, sha re-vérifié `1a1a2d3d`. Toutes restaurations ultérieures : Edit uniquement.

## 6. Lint / typecheck
lint-ratchet 69/69 avant et après ; `tsc --noEmit` exit 0 ; `eslint .` exit 0 ; `gate:vocab` exit 0.

## 7. Vérifs ciblées
`GOOD_PARAMS.alpha === 0.1` asserté, `alpha:0.10` épinglé ; seeds R=100 `interval_conformer_coverage` vert (aucun under_calib) ; l3 Test 2 vert (y compris sous M4) ; D6(b) tenu : `gate_byo_fail_closed` p>n à n≥nMin rend désormais `gate.reason=under_calib` (test n'asserte que action/allow/verdict.reason).

## 8. Déviations vs ADR
Aucune sur D1–D6 / §4. Clarifications : sha `d95cc0a3…` cité en provenance de l'épisode source (198 fenêtres, hors-repo) — le vecteur reproduit la structure n=191, ne hashe pas vers ce sha ; M3 concrétisé sur les 2 producteurs ; test 15 id `interval_lo_le_hi` conservé (référencé ADR-M002:270) ; JSDoc `decideInterval` corrigé (ordre NDG-1 → budget → WIDTH → intent) ; refs de ligne décalées signalées (gate.ts:169 « region.ts:48 », :271 « interval-conformer.ts:84 »).

## 9. Blocages
Aucun.
