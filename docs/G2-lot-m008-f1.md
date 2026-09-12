# G2 — Lot ADR-M008 F1 (Narabi / AttestedFlow)

> Revue G2 AgileGates, **relecteur ≠ générateur**. Relecteur : worker `claude-opus-4-8[1m]`, instance
> séparée, contexte frais (R-20 : ne produit ni ne committe). Générateur : agent principal (siège Opus).
> Date : 2026-09-12. ADR de rattachement : `docs/adr/ADR-M008-narabi-attested-flow.md`.

## Verdict G2 : **CLOS-AVEC-RÉSERVES** → **toutes réserves levées** (fix-pass générateur)
`npm run ci` **vert** chez le relecteur (`pass 194`, ré-exécuté R-21) et chez le générateur après fix-pass
(`pass 195`, +1 test de non-vacuité vocab). Typecheck + `gate:vocab` verts.

## Points confirmés par le relecteur (preuve reproductible)
- Contrat gelé `AttestedFlow` fermé à chaque nœud + sync (`ALLOWED_KEYS` ↔ schéma ↔ TS ↔ enum résidus) ; oracles `enums/schema/contracts.test` verts.
- **Zéro modif des 4 contrats gelés** : shas `attested-price/coverage-verdict/gate-decision/prediction` inchangés au manifest ; les lignes `-` de `types/serialize/index` sont des import/export étendus additivement ; `contracts_frozen` vert, **6 schémas**.
- `forbidden-keys` : `peg_score/p_depeg/nav` bannis globalement (ts+json sync) ; `price`/`mid` correctement ABSENTS du global (légitimes sur `attest`).
- Gate : `stable-run-velocity-24h` dispatché ⇒ abstain `under_calib` (`calib_digest==calibDigest([])`) ; **aucun nouveau `GateAction`/`CoverageReason`** ; garde anti-override inclut la classe ; `honestyText` branche dédiée (jamais la phrase CASCADE) atteinte de bout en bout via le registry.
- Tests mock-discriminants : vélocité recomputée à la main (anti-circulaire), 1h vs 24h = ×24, yhat non-numérique ⇒ erreur.
- Trace h5 : diff = **1 ligne** (`tools/list` `response_sha256`) ; décisions/digests byte-identiques ; probe vert (live==committed + sha==pin).
- Zéro-dette : procurement **P-F-5 formé** (pas un dû nu) ; aucun TODO/FIXME.

## Réserves et disposition

| # | Sévérité | Réserve | Fix (générateur) | `error_origin` |
|---|----------|---------|------------------|----------------|
| **R1** | **BLOQUANT G7** | Adaptateur fail-closed incomplet : ni `window`∈{1h,24h}, ni `residual`⊆enum, ni `Number.isFinite(yhat)` re-vérifiés ⇒ `window:"7d"` renvoie une RÉUSSITE avec `yhat=NaN`→`null` (Prediction invalide) ; résidu hors enum accepté silencieusement (contredit D3). Mode MAST « dérive contrat↔adaptateur ». | Gardes de valeur ajoutées (`window`, `residual`, `Number.isFinite`) ⇒ `binding_broken` ; **2 tests discriminants** (`window:"7d"` / résidu hors enum ⇒ `isNarabiError && binding_broken`). | générateur |
| R2 | non bloquant | Patterns vocab Narabi (`peg-score`/`p_depeg`, scopes monark+harness) sans test de non-vacuité (D5 « mutant surclaim ⇒ ROUGE » non honoré). | Test miroir `ci-gates.test.ts` : surclaim reddens, négation verte, sur les 2 scopes. | générateur |
| R3 | non bloquant | `PROVENANCE-h5-e2e-trace.md` date de génération périmée (2026-09-11). | Noté la régénération F1 (2026-09-12). | générateur |
| R4 | non bloquant | ADR §7 « 193 tests » vs mesuré 194→195. | Corrigé (195). | générateur |
| O1 | observation | Commentaire adaptateur « zero precision loss » = surclaim sous la granularité 1e-12 (burns=1, supply=1e13 → yhat=0). | Reformulé « no precision loss above the declared 1e-12 scale ». | générateur |

Observations O2 (oracle no-I/O = grep-source, motif ratifié — ne capte pas `import()` dynamique / lecture `process.env`, acceptable) et O3 (D5 « label unique » vs 2 phrases distinctes — imprécision de rédaction ADR, pas un défaut) : notées, sans action.

## Checkpoint-2 validateur (LIVRABLE) — ACCEPTE-AVEC-CORRECTIONS
Validateur `claude-fable-5-1`, contexte frais. Corrections bloquant F1b, levées :
- **C-1** — garde `burns > supply` erronée : `supply` = supply à la **clôture** (D2), donc un drain pousse le ratio au-dessus de 1 ; l'ancienne garde refusait le régime de run. **Levée** : garde supprimée + test `narabi_maps_the_run_regime` (mutant ré-ajoutant la garde ⇒ rouge, vérifié). Note ADR D4.
- **C-2** — `observed_at.instant` non borné ⇒ `RangeError` non attrapé. **Levée** : garde de plage + test.
- C-4/C-5/C-6 (doc) — entrée `JOURNAL-PROVENANCE.md` (modèle générateur + `error_origin` + comptes R-25), persistance du checkpoint-1 (`docs/CHECKPOINT1-M008.md`). Faits.

## G2-delta (revue du fix C-1/C-2, relecteur ≠ générateur, contexte frais)
Worker `claude-opus-4-8[1m]`, `npm run ci` ré-exécuté = **196 verts** (puis 197 après R-DELTA-1). Mutants vérifiés empiriquement (garde `burns>supply` ré-ajoutée ⇒ rouge ; garde `instant` neutralisée ⇒ `RangeError`). Verdict CLOS-AVEC-RÉSERVES :
- **R-DELTA-1** (classe R1) — la borne C-2 (`8.64e12 s`, représentabilité `Date`) laissait la fenêtre année ≥ 10000 produire un `produced_at` `+0YYYYY` **invalide au schéma gelé** (`format: date-time`, 4 chiffres) retourné en **succès** (`assertClosedPrediction` = keys-only). **Levée** : borne resserrée à `MAX_INSTANT_SECONDS = 253_402_300_799` (9999-12-31T23:59:59Z) + test frontière validant `produced_at` par ajv + test année-10000 ⇒ `binding_broken`. `error_origin` = générateur.
- **R-DELTA-2/3** (doc) — en-tête de test périmé (`burns>supply` listé comme fail-closed) + compte ADR 195→197. **Corrigés**. `error_origin` = générateur.
- **O-DELTA-1** — commentaire précision `RATIO_SCALE` reformulé (exactitude tant que ratio ≲ 9e3 ; jamais NaN/Inf). Corrigé.

## Suite
Verdict **G7 orchestrateur : CLOS** (oracle ré-exécuté R-21 : `npm run ci` **197 vert** ; R1/C-1/C-2/R-DELTA-1 fermées avec mutants discriminants). Clôture : commit local, 2 commits R-25 (branche `lot-m008-f1`). Pas de push public / pas de redéploiement VPS avant F1+F2 verts.
