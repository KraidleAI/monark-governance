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

## Notes de release v0.2.0 — ÉPINGLÉES (checkpoint-2 C-3 : « accepted text » ↔ « pushed text »)
**sha256 (LF, UTF-8)** = `5260dcda1cfa913113e3cfe9d237b28e399951a4d0842c517592609fade82cd2`. Au moment du
tag, `sha256(--notes file)` doit égaler cette valeur (sinon le texte poussé ≠ le texte accepté). Amendée
au checkpoint-2 (C-2) : `supply` du contrat gelé est la **clôture** (le stock d'ouverture est recalculé),
donc les notes disent « burns, mints and closing supply … a fraction of the opening stock, which it
recomputes ». Verbatim accepté :

```
MONARK v0.2.0 — Narabi (AttestedFlow)

Adds AttestedFlow, the fifth frozen typed contract: an attestation over token flow
(burns, mints and closing supply over a declared block window) that any agent can
recompute from onchain bytes. On top of it, a velocity adapter and a new gate class
stable-run-velocity-24h that reads redemption velocity as a fraction of the opening
stock, which it recomputes from those raw numbers.

The gate class abstains by design. It ships under_calib: the fixtures are synthetic and
declared, and no committed calibration exists yet, so the class returns abstain rather
than invent a verdict. This is the honest state, not a version one, and there is no confidence field anywhere in the interface.

The contract and adapter are in the repository. The public endpoint has not been
redeployed, so it still serves the two original classes; the repository is ahead of the
public endpoint by this class.

Next, v0.3.0 brings the first committed calibration, measured on a real redemption
episode and held out of sample. If the retrospective test fails, the class keeps
abstaining. We publish the method, not a trophy.

Apache 2.0. Five frozen typed contracts. Never a probability of being right.
```
