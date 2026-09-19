# Revue G2 — lot E-bon-marché (ADR-M018 D4, décision investisseur 18), gel `bbf53ce` sur `lot/e-bon-marche` (base `16ec12a`)

Relecteur : instance séparée, contexte frais, `claude-opus-4-8[1m]` (R-1). Rendu le 2026-09-19 (~08:05 UTC). Persisté par l'orchestrateur avant le checkpoint-2. Mutations en place restaurées byte-exact (backups scratchpad), arbre final prouvé propre `== bbf53ce`. Zéro `git` en écriture.

## Verdict : RÉVISION REQUISE → pliée `30665f4` + `5d24cb9`
| # | fichier:ligne | défaut mesuré | correction | error_origin |
|---|---|---|---|---|
| C2 | `apps/harness/test/gate.test.ts` (`numeric_under_calib_region_is_not_directional`) | voie numérique **servie** `stableRunVerdict` NDG zéro-largeur (`gate.ts:481`) non énumérée ; mutant retirant `labelSchema` à :481 **survit** 291/291 ; atteignable par probe (clé USDe committée + `yhat:1e300` → `under_calib`, `n_calib=613`, région `numeric`) ; G1 surclassait « toute voie servie » | 6ᵉ cas énuméré `runGate({...STABLE_RUN_PRED, predictor_id: USDE_STABLE_RUN_PREDICTOR_ID, yhat: 1e300}, GOOD_PARAMS)` — **mutant rejoué rouge par l'orchestrateur** (`stable-run committed key NDG zero-width: numeric under_calib region must be…`) | worker |
| C1 | `docs/G1-lot-e-bon-marche.md:127` | sha `3be6a66c…` de restauration E10 non reproductible (ni LF `943a8596…`, ni CRLF `06f47f80…`, pas un objet git) | remplacé par `943a8596…` (LF) | worker |

## Mutants rejoués
| mutation | résultat | message |
|---|---|---|
| E9 `interval-conformer.ts:71` `labelSchema` retiré | ROUGE | `cascade committed (no calibration): numeric under_calib region must be the empty set with a numeric label_schema` |
| E9 `gate.ts:481` `labelSchema` retiré | **VERT 291/291** → C2 (rouge après pliage) | — |
| E5 m1 import valeur `@monark/ukemi` | ROUGE | `@monark/monark: imports @monark/ukemi under src/ but does not declare it` |
| E5 m1-bis import type-only | ROUGE (le test attrape les imports de type) | idem |
| E10 byte-flip `stateJson` | ROUGE | `state.json bytes must match the published file` |

## Vérifié (fond du lot)
Oracle 291/291, lint 0, ratchet 69/69, export:check 0, lang-gate 0, `next build` 13 pages, `VACUITY_CONFIRMED=true`. E9 : `schemas/` + `packages/contracts` 0 octet ; `"numeric"` satisfait `minLength:1` + pattern ; voies directionnelles gardent `up|down` ; vacuité M019 D2 byte-identique (base `fd1203e9…` → tête `14773773…`, aucun test n'épingle ces digests) ; h5 re-pin diff 1 ligne, recorder rejoué byte-for-byte, `9b5457d9…` = `TRACE_SHA256_PINNED` = PROVENANCE. E5 : lockfile idempotent ; `apps/site` sans `@monark/*`. E10 : blobs `86c33c42…`/`4b17d0b8…` recalculés, cohérence interne test-gardée, **live-match byte-exact par GET** (T=1, pas de dérive). R-25 221/222 < 400. Vocab 0. Branchement M018 : `fleet.ts` intact, aucun `built`.

## Observations formées
- O1 : E5 scope `src/` seulement ; `test/` racine importe `@monark/contracts` non déclaré (hoisting) → item, déclencheur prochain lot `ci-gates`, propriétaire orchestrateur (exclure alors le littéral `@monark/y` du docstring).
- O2 : G1 « ~258 » vs 221/222 mesurés — note.
- O3 : digest b3 `64619eb9…` (ADR-M019 D2, ADR-M020:9, G2/CHECKPOINT2 b3) non reproductible par `vacuity-replay.mjs` (`fd1203e9` → `14773773`) — pré-existant, hors périmètre ; **item orchestrateur** : substituer le digest reproductible dans ADR-M020:9 au prochain pliage ADR-M020.
- O4 : fichier réel `test/narabi-live.test.ts` (racine), pas `apps/site/test/…` — note de registre.

## Pliage (orchestrateur)
C2 + C1 pliés `30665f4` ; commentaire de test remis en anglais `5d24cb9` (le test 42 export/lang-gate a attrapé un accent — `error_origin` orchestrateur). Oracle 291/291, mutant :481 rouge.
