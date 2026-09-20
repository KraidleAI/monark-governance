# G0 — Sprint backlog lot U-3 : census → Y_{i,e} décomposé (3 événements), déficit v3.3, bissection de source
Orchestrateur `claude-fable-5-1`, 2026-09-20. Base : `lot/etude-suite` HEAD `830f699`. Branche `lot/u-3`, worktree `F:\Monark-wt-u3`. Cadre : ADR-M020 D1 (b) (cible Y_{i,e} = dette liquidée de la position i dans l'événement e sur 24 h, décomposée repayment / seized / bad debt), D4 ligne U-3 (« census → Y_{i,e} décomposé (2025-02, 2025-10, 2026-01) ; topic déficit v3.3 vérifié ; bissection de source ; sha JSONL, quorum-2 »), D6 (topic0 `DeficitCreated` = `0x2bccfb3f…`, v3.3 déployé 2025-02-24), census A (`docs/census-2026-09-18/A-aave-liquidations.md`, `data/A-*.jsonl`), M-2b (`MESURES-M2b-sources-2026-09-19.md`), ADR-U1 D3 (quorum-2 par méthode, ≤ 300 appels/min, `rpc.ts` réutilisé), décision CGU 2026-09-19 (réponses RPC brutes hors dépôt, séries réduites seules, sha des bruts en PROVENANCE). Régime site : **T0** (données + scripts, aucune surface publique). Isolation : `docs/census-*`, `scripts/census/**`, `packages/ukemi/test/fixtures/**` (nouveaux fichiers seulement) — aucun fichier partagé avec U-2 ni Bell -b1-2.

## Objectif (une phrase)
Produire, sha-pinné et rejouable, le tableau des réalisations Y_{i,e} par position pour les trois événements Aave v3 core observés (2025-02-21 sUSDe, 2025-10-10/11 WETH, 2026-01-19), décomposé en repayment / collatéral saisi / déficit, avec la source d'oracle de chaque actif à chaque bloc de liquidation, pour que U-4 calibre sur des étiquettes réelles et non synthétiques.

## Livrables (liste fermée)
| # | Fichier | Contenu | Test / oracle |
|---|---|---|---|
| L-1 | `docs/PLAN-u3-prereg.md` (pré-enregistrement **haché avant tout pull**, sha dans PROVENANCE) | hypothèses : U3-H1 « `DeficitCreated` apparaît dans ≥ 1 des 3 événements » ; U3-H2 « la source d'oracle par actif est constante à l'intérieur de chaque événement (24 h) » ; U3-H3 « Σ repayment par événement = Σ `debtToCover` du census A à l'unité près » ; fenêtres 24 h **ancrées bloc** (premier `LiquidationCall` du cluster − 0 → + 24 h en blocs, `windows.ts`), pas en horodatage | sha du plan cité dans L-4 avant la première ligne de données |
| L-2 | `scripts/census/u3-realized.mjs` (off-CI, resumable, keyless + `CHAINSTACK_ETH_URL` par env, **jamais imprimée**) | par événement : logs `LiquidationCall` (déjà en `A-rawlogs.jsonl` pour 2025-02 et 2025-10 — **réutilisés**, pas re-tirés ; 2026-01-19 tiré à neuf), logs `DeficitCreated` sur la fenêtre, `Transfer` du debtToken (burn) pour croiser `repayment`, `Transfer` aToken vers liquidateur pour croiser `seized` ; **bissection de source** : `getSourceOfAsset`+`description()` à `B_first−1` et `B_last` de chaque événement (quorum-2) ; positions = `user` du log, agrégation 24 h par (user, événement, debtAsset, collateralAsset) | quorum-2 par méthode (`no_quorum` ⇒ ligne abstenue, jamais partielle) ; politesse ≤ 300/min ; **bruts hors dépôt** `F:\PRODUITS\etude-2026-09-20\u3-raws\` sha-pinnés |
| L-3 | `docs/census-2026-09-20/data/U3-realized.jsonl`, `U3-sources.jsonl`, `U3-deficit.jsonl` (séries réduites, ADR-M003 D9 sexies, `series_pinned_are_declared_and_hashed`) | une ligne par (i, e) : `user, event_id, debtAsset, collateralAsset, repayment_base, seized_base, deficit_base, n_calls, first_block, last_block, oracle_source_debt, oracle_source_collateral, residual[]` (`partial_liquidation`, `source_change`, `no_quorum`, `deficit_topic_absent`) ; montants en base-monnaie 8 déc. via `getAssetPrice` **au bloc du log** (jamais un prix moyen) | `u3_series_replay_bit_identical` (rejeu depuis les bruts archivés ⇒ sha identique) ; `u3_sum_repayment_matches_census_a` (U3-H3, mutant : une ligne retirée ⇒ rouge) ; `u3_deficit_topic_selftest` (keccak inline de `DeficitCreated(address,address,uint256)` = `0x2bccfb3f…`, méthode `Transfer`) ; `u3_no_synthetic_row` (chaque ligne porte un tx hash présent dans les bruts) |
| L-4 | `docs/census-2026-09-20/U3-realized.md` | provenance (modèle résolu, fournisseurs = domaines seuls, quorum, N appels, temps), faits [lu] avant pull, tableau par événement (n positions, Σ repayment, Σ seized, Σ deficit, sources), **n_e par événement vs seuils Dunn** (n > 99 à α = 0,01 ; 19 à 0,05 ; 9 à 0,10) sans conclure sur α (décision U-4), écarts aux hypothèses U3-H1..H3 rapportés tels quels, limites | relecture G2 ; aucun chiffre sans ligne JSONL |
| L-5 | `docs/adr/ADR-U3-realized-labels.md` | décision (étiquettes réelles remplacent les paires synthétiques ; décomposition ; fenêtre bloc), alternatives (horodatage — refusé ; subgraph — refusé, [2nd]), **tuyaux** : entrée = census A + RPC quorum-2 ; sortie = `U3-realized.jsonl` **consommé par U-4** (calibration) et U-7 (papier) — état `annex` jusqu'à U-4, jamais `built` ; procurement formé si Perez Eq. 3 paginée manque encore (PR-U1-1) | doc |
| L-6 | `docs/PLI-lot-u3.md` | touched set, numstat, sha, R-25, coût RPC mesuré | — |

## Critères d'acceptation
1. `npm run ci` = base + 4 tests ; lint 0 ; ratchet 69/69 ; lang-gate 0 ; export:check 0 ; `series_pinned` vert avec les 3 nouvelles séries déclarées.
2. Mutants ≥ 4 rouges (ligne retirée ; sha de série altéré ; topic déficit altéré ; ligne sans tx hash).
3. Aucune clé, URL ou uuid dans le dépôt ni dans le rapport ; `no_secret_in_repo` vert ; bruts hors dépôt sha-pinnés.
4. R-25 ≤ 400 (séries exclues par D9 sexies ; docs exclus ; script + tests comptent).
5. CA-11 : aucune pièce nouvelle `built` ; sortie déclarée `annex` avec consommateur U-4 nommé ; `fleet.ts` inchangé.
6. Pré-enregistrement haché **avant** le premier appel (sha dans PROVENANCE, vérifiable par l'ordre des commits).

## Hors périmètre
Calibration (U-4), toute prédiction, énumération du book (U-1a), Bell.

## Tuyaux (ADR-M018 D3)
census A + RPC quorum-2 → `u3-realized.mjs` → séries U3 → U-4 (calibration), U-7 (papier). État : `annex`.

## Risques (MAST)
Prix moyen au lieu du prix au bloc ; fenêtre en horodatage ; `DeficitCreated` absent pris pour « pas de déficit » (résidu `deficit_topic_absent` obligatoire, distinct de « déficit = 0 ») ; secret dans un log ; 2026-01-19 mal borné (1 liquidation au census A : dire n = 1).

## Rôles
Checkpoint-1 validateur avant tout code. Worker Opus 4.8 max (G1, RPC live autorisé sous quorum-2 et budget `--max-calls` obligatoire) → G2 fraîche (offline, rejeu depuis bruts) → checkpoint-2 → G7 → fusion.
