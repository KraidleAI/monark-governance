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
- **Sidecar 1** : `fill-ts | 2026-09-23T00:15:12Z (lancé 00:00:24Z, script verbatim F:\course-ukemi\fill-ts-4.sh, log F:\course-ukemi\logs\fill-ts-4.log) | HEAD f28a184687db846ec122c05095df26b0523991d8 | sélecteur 20e1cf9d477d869afe0498d201680bd1037069176b6700865ceb47194a953280 | opérateurs drpc.org,mevblocker.io,nodies.app | min-interval 150 | calls 4336/20000 | n_extra 1916 | block_ts_extra_sha256 3fc421b9501e00742dab7ed78ecf400fea8ff303b2bc90d3e25a4e6947f0bce9 | discover_sha 2ffa3acfa317118e419545bdf0e80491a425097f34d391db30ad0f0d3b093fa8 | C-1 : phase=complete, discover_ok, self_sha_ok (exit 0) ; 0.8 : 0 verrou, une ligne unlocked par opérateur | fichier sidecar sha256 b20554bf26f95442de510daf4cb5b091d3b56763c2965aab420a91401e239a09 | exit=0, 0 STOP, 0 reprise`.
- **Sidecar 2** : `sélection | 2026-09-23T00:17:02Z (2a) / 00:17:21Z (2b) / 00:17:46Z (2c) | episode weth-2025-09-22 | B_first 23414969 / B_last 23422118 / B0 23414968 | n_distinct 72 (candidates 249, eligible 19, window_truncated 0, n_excluded_e2 900, residual_outside_window 0) | selection_sha256 ad2341b5f7618703c23efee513eb98e44da84e5eb516ec175a3700b189381904 | rawlogs_sha256 aed6ddbdef2bd1f7db048c223c5fc613a65d461aef3c3e26ebf2bca6748769a2 | events_sha256 8d8edf7409a5594c6e4d0afebeadaafe2da0dd883384a5d57e8d19bc417353b1 | block_ts_extra_sha256 3fc421b9… | rejeu identique (2b : REJEU IDENTIQUE, cmp des 3 fichiers) | C-2 tout vrai (discover_ok, prereg_ok, selection_sha_ok, rawlogs_ok, events_ok, b0_ok, n_min_ok, b_hi 26034127, e2_window [23545088,23557060]) | version_check.impl 0x97287a4f35e583d924f78ad88db8afce1379189a | version_ok true (== v3.5.0, H-1 OK, C-3 exit 0) | checked_at_utc 2026-09-23T00:17:46.636Z | operators drpc.org,mevblocker.io,tenderly.co | calls 2/9 | selection_sha256 INCHANGÉ après 2c (C-2 selection_sha_ok true) | arbre d'exécution 2a-2c : F:\Monark @ b147db0 (docs seuls depuis f28a184 ; sélecteur = blob 20e1cf9d…)`.
