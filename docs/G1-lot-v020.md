# G1 — Génération tracée, Lot v0.2.0 (Narabi F1-only sur main : merge + wording honnêteté + fix ratchet)

- **Générateur** : orchestrateur (siège committeur `claude-opus-4-8`, exception Opus-seat) pour le merge +
  le wording ; **worker `claude-opus-4-8[1m]`** (R-1 vérifié) pour le fix lint-ratchet (dispatché, tâche
  localisée + oracle déterministe). Branche `main`. 2026-09-16. Aucun push.
- **Spec / décision** : **ruling investisseur Option A 2026-09-16** — `v0.2.0` = **F1 seul** (`under_calib`),
  F2 = `v0.3.0`. ADR-M008 (F1) + ADR-M010 §2.3 amendée + ADR-M008 §3 amendée.

## Contenu
- **Merge F1** : 4 commits F1 cherry-pickés sur `main` (`6f99888` gel AttestedFlow 5ᵉ contrat → `e98268b`
  adaptateur+classe `stable-run-velocity-24h` → `41d79fd` dénominateur start-supply → `fa5ad38` ACI doc).
  Conflit unique `JOURNAL-PROVENANCE.md` (append vs append) résolu en gardant les deux. **4 contrats gelés
  existants byte-INCHANGÉS** (`git diff 3b9805a main -- schemas/{attested-price,prediction,coverage-verdict,
  gate-decision}.schema.json` vide), manifest re-baseliné (5 schémas). **Set terminal 4 outils inchangé**
  (`registry.ts:32`, `stable-run-velocity-24h` = `task_class` de `gate`, pas un 5ᵉ outil).
- **Wording honnêteté** (`e286b5b`, guards advisor-defi Q3) : ADR-M008 §3 amendée (F1-only v0.2.0,
  redéploiement endpoint gaté/distinct, écart « in the repository, not yet on the public endpoint » ;
  `under_calib` ≠ `under_witness`) ; README (4→5 contrats gelés, statut Narabi « shipped, calibration
  pending », jamais « V1 ») ; SKILL.md (3ᵉ classe repo-only, `under_calib`, pas encore servie par l'endpoint).
- **Fix ratchet** (`53089a1`, worker) : G2 a RÉVÉLÉ que F1 ajoutait 13 sites `any` ⇒ lint-ratchet 105 > 92
  (rouge dry-run + CI publique ; invisible au `npm run ci` de F1 qui n'exécute pas le ratchet). Typé les 13
  sites (type `SchemaNode` pour loadSchema/load ; cast typé pour le cfg vocab) ⇒ **105 → 69**, plafond
  **abaissé 92 → 69** (doctrine D9 ter §3, sens unique vers le bas, jamais relevé). Fold : README row
  AttestedFlow + « four→five » ; ADR-M008 §7 pointeur vers l'amendement §3.

## Oracle (arbre final, R-21 orchestrateur)
`npm run ci` **204/204** ; `node scripts/lint-ratchet.mjs` **69/69 exit 0** ; `npx eslint .` exit 0 ;
`npm run lang:gate` 0 ; `npm run export:check` 0 ; `typecheck` 0. **v0.2.0 --dry-run** : gates OK → tag/notes
plan atteint, 26 entrées **M/A (zéro D, out/ préservés)**, adapter+test+attested-flow.schema.json shippés,
aucune fuite gouvernance ; notes `checkReleaseText` ok=true. `error_origin` du ratchet = F1 (dette de typage
non attrapée par son propre oracle ; attrapée au G2 release).
