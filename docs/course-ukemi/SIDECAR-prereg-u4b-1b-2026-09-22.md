# Sidecar daté — course U-4b-1b (régime B, ADR-U4b D4 / prereg §8b-8c)

Écrit par l'orchestrateur `claude-fable-5-1` le 2026-09-22T07:42:36Z (`date -u`), immédiatement après le commit SEUL du prereg.

| Marqueur | Valeur |
|---|---|
| Commit du prereg | `a75dbf1` (v2 §5b, supersède `9e095a0`) (`docs/PLAN-u4b-prereg.md`, docs-only, sur `lot/etude-suite` @ parent `fef167d`) |
| `--prereg-sha` (sha256 LF du blob HEAD) | `1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49` (v2 ; v1 = `770413d9…`) |
| `--labeler-sha` (sha256 LF de `scripts/census/u3-realized.mjs`) | `cb0204250cce05f4846c7cfe821e72eecac22ffd636cfde4acff6a205b41a1af` |
| Tranche réducteur pur | `1c7574acd325ab75e6760f50d6743e3d9d39cd5565abbf3d497d4884317a6ada` |
| 8 autres sha gelés | recomputés 9/9 concordants sur `fef167d` (voir prereg §2) |
| Floor Chainstack lecture n°1 (candidate) | 12 904 RU, 2026-09-22 05:22 UTC, `FAITS-floor-chainstack-2026-09-22.md` |
| Floor Chainstack lecture n°2 (`<FLOOR-CHAINSTACK>`) | **12 916 RU**, lue sur place (session investisseur) 2026-09-22 13:5x UTC, `FAITS-floor-chainstack-n2-2026-09-22.md` |
| Découverte / brut / sonde go-no-go | à renseigner au fil de la course (mêmes valeurs `prereg_sha`/`labeler_sha` que ci-dessus) |

Commande de recompute : `git show a75dbf1:docs/PLAN-u4b-prereg.md | tr -d '\r' | sha256sum`.

## Lignes de course (RUNBOOK `docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md`, une ligne par étape, ajoutées par l'orchestrateur)
- **Sidecar 0** : `préconditions | 2026-09-23T00:00:24Z | HEAD f28a184687db846ec122c05095df26b0523991d8 (= <HEAD_E1>, G7 U-4b-1b-3) | 0.2 vert (blob LF du sélecteur 20e1cf9d477d869afe0498d201680bd1037069176b6700865ceb47194a953280, return Infinity ×2 ; oracle tronc 7 gates 0, 951/950/0/1) ; 0.8 aucun verrou (F:/monark-ledger/chainstack-2026-09-19/chainstack-2026-09-19 vide) ; block-ts-extra.json ABSENT | R-A levé (G7), R-B --operators drpc.org,mevblocker.io,nodies.app --min-interval-ms 150, R-C --ledger-dir F:/monark-ledger/chainstack-2026-09-19 --cycle chainstack-2026-09-19, <N_FILL> = 20000 (ruling (e), CHANTIERS 23:59) | exécutant claude-fable-5-1`.
- **Sidecar 1** (`fill-ts`) : à l'issue de l'étape 1 — lancée 2026-09-23T00:00:24Z, script verbatim `F:\course-ukemi\fill-ts-4.sh` (détaché, pid dans `F:\course-ukemi\fill-ts-4.pid`, log `F:\course-ukemi\logs\fill-ts-4.log`) ; règle de supervision : aucun outil n'ouvre `block-ts-extra.json` ni `.tmp-*` pendant le run.
