# G2 — Revue, Lot v0.2.0 (Narabi F1-only : merge + wording + fix ratchet)

- **Réviseur G2** : worker `claude-opus-4-8[1m]` (R-1 vérifié), **instance séparée du générateur, contexte
  frais**. Ne committe pas. 2026-09-16.
- **Verdict G2 initial** : **FAIL** — cause unique : le **dry-run de release rougit à `lint-ratchet 105 >
  92`** (déclencheur FAIL explicite ; la CI publique rougit à l'identique via `.github/workflows/ci.yml`).
  Tout le reste **VERT**.

## Vérifié par le G2 (empirique, rejouable)
- **Wording honnêteté PROPRE (aucun surclaim public)** : Narabi `under_calib`, jamais « V1 »/« calibrated »/
  « working » ; l'écart endpoint (« in the repository, not yet on the public endpoint ») déclaré sur les
  **3 surfaces** (README, SKILL, ADR §3) ; `under_calib` ≠ `under_witness` présent+correct ; « shipped »
  toujours borné par « abstaining (`under_calib`) » et « *not* a delivered prediction product ». Compte
  flotte cohérent (3 built · Narabi shipped abstaining · 7 named).
- **Contrats gelés INTACTS** : `git diff --exit-code 3b9805a main -- schemas/{attested-price,prediction,
  coverage-verdict,gate-decision}.schema.json` = **vide** ; AttestedFlow ajouté (5ᵉ) ; manifest re-baseliné,
  `contracts_frozen` ×2 verts ; set terminal **4 outils** (`registry.ts:32`), pas de 5ᵉ.
- **Notes v0.2.0 HONNÊTES** : `checkReleaseText` **ok:true** ; aucun « V1 », aucun narratif [2nd] msUSD
  (pas de PoR/$/collapse/nom d'émetteur/depeg) ; « no confidence field » contigu (exempt).
- **Sécurité export** : diff reconstruit = ships adapter+test+attested-flow.schema.json ; **0 fuite
  gouvernance** ; **0 suppression** de `out/{mint.txt,logo.png,banner.jpg}` ; notes acceptées.
- **Oracle reproduit** : `npm run ci` 204/204 ; `lang:gate` 0 ; `export:check` 0 ; `npx eslint .` 0 (⇒
  lint-ratchet = SEUL bloqueur).

## Finding bloquant + résolution G7 (correction-loop)
- **BLOCKER (lint-ratchet 105>92)** : F1 a ajouté **13 sites `any`** (contracts.test.ts 41-47, enums.test.ts
  32-33, ci-gates.test.ts 142-146) sur des fixtures AttestedFlow. Invisible au `npm run ci` de F1 (qui
  n'exécute pas le ratchet) ; attrapé par le gate release (superset). **Résolu (worker `53089a1`)** : typé
  les 13 sites (`SchemaNode` + cast) SANS `any` ; count **105→69** ; plafond **abaissé 92→69** (jamais
  relevé, doctrine sens-unique). `error_origin` = **F1** (dette de typage), attrapée au G2, corrigée avant
  tag. Aucun changement runtime (annotations de type).
- **NITs pliés** : README « four→five contracts » + row AttestedFlow (honnête, no score/price) ; ADR-M008 §7
  pointeur vers l'amendement §3 (retire l'auto-contradiction « F1+F2 verts avant push »).
- **INFO restant (non-bloquant)** : `under_witness` en fonte code alors qu'il n'est pas un reason-code live
  (seul `under_calib` l'est) — distinction honnête, framing prose possible plus tard ; dette de typage
  pré-existante hors périmètre F1 (capturée par le plafond 69, doctrine sens-unique vers 0).

## Oracle final (après fix)
`node scripts/lint-ratchet.mjs` 69/69 exit 0 ; `npm run ci` 204/204 ; `eslint` 0 ; `lang:gate` 0 ;
`export:check` 0 ; **v0.2.0 --dry-run** atteint le plan tag/notes, 26 M/A zéro-D. Rien poussé.
