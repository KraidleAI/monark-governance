# G2 — Revue fraîche, Lot F2-B (`stable-run-velocity-24h` / USDe)

- **Relecteur** : worker **`claude-opus-4-8[1m]`** (R-1), **instance séparée, contexte frais, ≠ générateur**. 2026-09-17.
- **Verdict : PASS-AVEC-RÉSERVES — 0 bloquant, 4 réserves non bloquantes (texte).** Arbre restauré byte-exact
  (mutants restaurés par Edit, jamais `git checkout`).

## Checklist
1. **Conformité spec — PASS.** Clé `narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3`
   exacte (`gate.test.ts:84-85`, `usde-calibration.test.ts:83-85`). Fonction de clé **partagée** `narabiPredictorId`
   (`adapter-narabi.ts:58-62`) importée par `calibration.ts:17,74` — registre UNIQUE `COMMITTED_CALIBRATIONS`
   (`calibration.ts:195-209`), **aucune map issuer→famille** (grep). Segment formule conservé. Canonicalisation
   vérifiée (`"EIP155:1"`,`"ERC20:0x4C9EDD…"` ⇒ clé committée identique).
2. **Digest, indépendamment — PASS.** `calibDigest([0,1])=1e47beee…` ✓ ; `calibDigest(fixture, n=613)` =
   **`c9793b28…e86c`** ✓ ; sha256(LF) série = `7c33027a…9ef1` ✓. **Mutant M5** (score altéré) ⇒ import **throw**
   (`computed 6d2f856d… != pinned`). Restauré.
3. **A1, indépendamment — PASS.** Recorder rejoué : 30/665/28/637/403, ρ=0.6327, n=613, q̂=1.3119228e-4 (s61,
   croisé split), q99=3.40093727e-4 (s6), sensibilité q99=1.2211e-3, rétro 10/11/12 true. `usde-calib-scores.json`
   reproduit **byte-identique** (sha `e44a68b6`). Critère pré-enregistré appliqué tel quel — **inexact sur UN point, attrapé par checkpoint-2 (C-14)** : la
   condition rétrospective §5.1.5 n'était PAS encodée dans `committable` (branche « valide mais rétrospective
   négative » inatteignable) ; cette G2 n'avait aucun mutant sur la logique de clôture du recorder. Corrigé
   (C-14), résultat empirique inchangé (10/11/12 oct. > q99). Écart 1e6↔1e12 établi
   **par construction** (sélection BigInt sur wei, indépendante d'échelle) **et par mesure** (max|Δ|=4.1055e-8) —
   pas de re-sélection.
4. **Discrimination (mutants) — PASS.**

   | Mutant | Site | Rouges | Verts (asymétrie) |
   |---|---|---|---|
   | M1 clé aveugle | `calibration.ts:208` | A7acde, A2_A7f, A6, noncommitted | **A7b vert** |
   | M2 BYO sans lookup | `gate.ts:507-508` | A6 | reste vert |
   | M3 honnêteté toujours committed | `gate.ts:454-456` | A2_A7f | reste vert |
   | M4 NDG-1 retirée | `region.ts:60-65` | ndg1_reused + M011 (msusd/all_zeros/equal_bounds) | **l3_handbuilt vert** (garde L3 disjointe, M011 D3) |
   | M5 score altéré | `calibration.ts:92` | import throw | — |

   NDG-1 **réutilisée**, aucune 2ᵉ garde (grep). A7 (a)(b)(c) = vrais flux `narabiFlow → fromAttestedFlow → runGate` ;
   (d)(e) = `Prediction` émis par l'adaptateur avec `predictor_id` surchargé (seule façon d'obtenir une clé
   altérée/nue). Pas de `Prediction` fabriqué.
5. **Contrats gelés — PASS.** `git diff --stat -- schemas/ packages/contracts/src/` = **VIDE**. 4 outils inchangés.
6. **Honnêteté — PASS-AVEC-RÉSERVES.** `gate:vocab` vert (115 fichiers, scope `narabi_docs`). CAVEAT présent, non
   minimisé (CLOTURE §4). R-1..R-4 présents (§5). Barber NON cité. C-13 3 issues. Porteurs K-1 keyés
   (`gate.ts:449-457`). Unique hit `PROVENANCE-usde.md:7` `probability` = négation (disclaimer) ⇒ réserve R-2.
7. **h5 — PASS.** Régénéré via builder, 15731 octets, sha = pin `09cd5b37…3bf3`, byte-identique au working tree.
8. **Correctif hors-lot `interval-conformer.ts:85` — PASS.** Commentaire seul (FR→EN), zéro logique ; `lang:gate` 0.
9. **Oracle — PASS.** `gate:vocab` OK ; tsc 0 ; **222/222** ; `lint-ratchet` 69/69 (json non modifié) ; `lang:gate` 0 ;
   `export:check` 0.
10. **MAST — PASS-AVEC-RÉSERVES.** Aucun pooling caché (M1) ; seul chemin résiduel = R-1 déclaré ; valeurs écartées
    uniquement en `assert.notEqual` ; registre unique ; dérives doc ⇒ réserves.

## Réserves (non bloquantes) — toutes appliquées par l'orchestrateur au G7
- **R-1** entrée `JOURNAL-PROVENANCE.md` F2-B (action G7) — **faite**.
- **R-2** `npm run vocab` inexistant → `gate:vocab` (CLOTURE :6/:96, PROVENANCE :6) — **corrigé**.
- **R-3** commentaires `gate.ts` :46 et :10-13 périmés — **rafraîchis** (commentaires seuls).
- **R-4** `04-task-classes.md` scratch hors repo — informatif, déjà déclaré au PLAN §10.

## Preuve R-21
Shas pré == post : `calibration.ts 80758c4a…`, `gate.ts ba2b85f4…`, `region.ts 1a1a2d3d…` ; fixtures reproduites
à l'identique (`usde-calib-scores.json e44a68b6…`, `h5-e2e-trace.json 09cd5b37…`). `git status --porcelain` identique.
