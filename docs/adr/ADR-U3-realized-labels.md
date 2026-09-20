# ADR-U3 — Étiquettes réelles Y_{i,e} : la dette liquidée décomposée par position remplace les paires synthétiques

- **Statut** : **proposé (G0 → G1 fait)** — lot U-3 du programme ADR-M020 (D1 (b), D4 ligne U-3). Checkpoint-1 validateur
  `claude-fable-5-1` APPROUVÉ-AVEC-CORRECTIONS C-1..C-11 (`docs/CHECKPOINT1-lot-u3.md`), pliées dans `docs/G0-lot-u3.md`.
- **Dates** : décision 2026-09-20 · rédaction worker `claude-opus-4-8[1m]` (R-1, effort max) · verdict/commit : orchestrateur
  `claude-fable-5-1` (R-20). **Aucun commit, aucun workflow par le worker.**
- **Gate** : G0 (cet ADR) → G1 (script + séries + tests) → G2 fraîche (offline, rejeu depuis bruts) → checkpoint-2 → G7.
- **Éléments produits** : `scripts/census/u3-realized.mjs` (+ `.d.mts`), `test/u3-realized.test.ts` (4 tests),
  `apps/sentinel/test/fixtures/ukemi/u3/{U3-realized,U3-sources,U3-deficit,U3-inputs}.jsonl` + `PROVENANCE-u3.md`,
  `docs/census-2026-09-20/U3-realized.md`, `docs/PLAN-u3-prereg.md`. **Non touchés** : `apps/sentinel/src/**` (rpc.ts, rpc2.ts,
  abi.ts, windows.ts, clusters.ts **réutilisés sans modification**), `fleet.ts`, `schemas/**`, tout code Narabi/Bell.

## Contexte (mesuré)
1. `packages/hikae/src/liquidable-24h.ts` génère des paires **synthétiques** (n=300, α=0,01, « no real 24h label »,
   ADR-U1 contexte 4). La classe M016 `liquidation-realized-given-oracle-path-24h` (ADR-M020 D1 (b)) exige la cible **Y_{i,e}
   réelle** : dette liquidée de la position i dans l'événement e sur 24 h, décomposée repayment / seized / déficit.
2. Trois événements observés au census A (`d0f4aa1e…`) : e1 2025-02-21 sUSDe (5 appels/3 positions), e2 2025-10-10/11 WETH
   (268 cluster / 239 in-window / 194 positions), e3 2026-01-19 sUSDe (1/1). Sources d'oracle datables (M-2b : bascule
   sUSDe/USDe 22002625, feed WETH SVR 22803459). Topic `DeficitCreated` = `0x2bccfb3f…` (ADR-M020 D6), v3.3 déployée 2025-02-24.

## Décision
**D1 — Étiquettes réelles.** Y_{i,e} est **mesurée on-chain**, par position `(user, debtAsset, collateralAsset)`, agrégée
sur la fenêtre 24 h, décomposée : `repayment_base = Σ floor(debtToCover × getAssetPrice(debt)@bloc / 10^dec)` ;
`seized_base = Σ floor(liquidatedCollateralAmount × getAssetPrice(coll)@bloc / 10^dec)` (frais protocole exclu) ;
`deficit_base` = Σ `DeficitCreated(user, debtAsset, amount)` de la fenêtre joints par `(user, debtAsset)`. Montants base en
`BASE_CURRENCY_UNIT()` (8 déc., **lu on-chain**, jamais codé). Sommes natives conservées. **Prix au bloc du log**, jamais un
prix moyen (résidu `price_moved_in_block` si l'oracle a bougé dans le bloc). Les paires synthétiques de `liquidable-24h.ts`
sont **remplacées** par ces étiquettes en U-4 (aucune modification de `liquidable-24h.ts` en U-3).

**D2 — Fenêtre ancrée bloc, jamais horodatée.** `B_first` = premier `LiquidationCall` du cluster (A-rawlogs, déterministe) ;
`B_last = firstBlockAtOrAfter(ts(B_first)+86400) − 1` (`apps/sentinel/src/windows.ts`, ts de bloc en quorum-2). Lignes de
bloc > B_last comptées en résidu `outside_window` (e2 : 29). Le cluster e2 = collatéral WETH, bloc ∈ [23545088, 23557060]
(M-2b, sha-pinné).

**D3 — Décomposition et déficit.** `DeficitCreated` sourcé par `getLogs(Pool, [topic], [B_first,B_last])` (autoritaire, complet
pour la fenêtre), classé : `in_event` (join à une position), `bad_debt_other_reserve` (`_burnBadDebt`, autre réserve du même
user), `window_other` (bad debt d'un autre collatéral dans la fenêtre — hors cluster, contexte). e1 pré-v3.3 ⇒
`deficit_topic_absent` **par construction**. Cross-check C-7 sur les `Transfer` underlying (repayment = liquidateur → aToken(debt) ;
seized = aToken(coll) → liquidateur) ; écart ⇒ `xfer_mismatch` (mesuré : 0).

**D4 — Quorum-2 par méthode, discipline secret.** Deux **opérateurs** distincts (`providerOf`) concordants (ADR-U1 D3),
sinon `no_quorum` ⇒ ligne abstenue. Fournisseurs : `CHAINSTACK_ETH_URL` (archive, env, **jamais imprimé**) + keyless de
`rpc.ts`. Bruts hors dépôt sha-pinnés ; séries réduites in-repo rejouées en CI (C-3) ; aucune URL/clé dans le dépôt.

## Alternatives rejetées
- **Fenêtre horodatée** (timestamp) : refusée — la classe M020 D1 (b) est **ancrée bloc** ; l'horodatage n'est pas rejouable
  bit-identique (leçon M-2 → M-2b). Contre-mesure : `windows.ts` `firstBlockAtOrAfter`, grep interdisant `latest`.
- **Subgraph / indexeur tiers** (The Graph) : refusé — chiffre de **seconde main** [2nd] non rejouable ; on lit les logs et
  l'état on-chain first-hand en quorum-2.
- **Paires synthétiques** (`liquidable-24h.ts`) pour Y : refusé (contexte 1, ADR-U1 contexte 4).
- **Prix moyen sur la fenêtre** : refusé — `getAssetPrice` au **bloc** du log (D1, M020 D2).

## Tuyaux (ADR-M018 D3 / règle de branchement)
| Tuyau | Entrée (qui produit) | Sortie (qui consomme) | État | Test |
|---|---|---|---|---|
| census A + RPC quorum-2 → labels | `A-rawlogs.jsonl` (`d0f4aa1e…`) + `u3-realized.mjs` (RPC archive quorum-2) | `U3-realized.jsonl` / `U3-sources.jsonl` / `U3-deficit.jsonl` | in-repo, sha-pinné | `u3_series_replay_bit_identical`, `u3_sum_repayment_matches_census_a`, `u3_deficit_topic_selftest`, `u3_no_synthetic_row` (4 tests, rejeu offline depuis `U3-inputs.jsonl`) |
| labels → calibration | `U3-realized.jsonl` | **U-4** (Mondrian intra-événement, bras gate) | **`annex`** (jamais `built`) | **`u4_calibrates_from_u3_realized_labels`** — nom réservé, **écrit au lot U-4** (test d'intégration du tuyau consommé) |
| labels → papier | `U3-realized.jsonl` + `U3-realized.md` | **U-7** (papier « Eligible is not liquidated ») | `annex` | relecture externe (U-7) |

**Branchement (CA-11)** : la sortie U-3 est déclarée **`annex`** jusqu'à ce que U-4 la consomme par un chemin **servi** couvert
par le test d'intégration `u4_calibrates_from_u3_realized_labels` — **jamais `built`** avant. `fleet.ts` inchangé. Un tuyau
absent est un item formé avec déclencheur (le test U-4), jamais un oubli.

## Modes d'échec MAST (checklist de risque résiduel — C-11)
| Mode | Menace | Contre-mesure (implémentée) |
|---|---|---|
| Fixture auto-enregistrée | les 4 tests rejouent ce que le script a écrit | **G2 re-tire ≥ 3 lignes live quorum-2** indépendamment de `U3-inputs` (motif ADR-U1 C-7) ; reproduction from-scratch = même sha de séries |
| Vérification incorrecte | prix moyen ; fenêtre horodatée ; sha horodaté | prix **par bloc** (résidu `price_moved_in_block`) ; fenêtre **ancrée bloc** ; séries **sans horodatage** (rejeu bit-identique) |
| Déficit absent pris pour « 0 » | `DeficitCreated` non émis ⇒ conclusion fausse | `deficit_topic_absent` **distinct** de « déficit = 0 » (e1) ; **contrôle positif** (28 `DeficitCreated` réels décodés en e2) ; topic keccak self-testé ; mutant topic ⇒ rouge |
| Fuite de secret | URL/clé archive dans un log/série | tout message réécrit en `providerOf` ; leg archive = booléen ; `no_secret_in_repo` vert ; bruts hors dépôt |
| Perte d'info inter-agents | book/labels partiels présentés complets | `no_quorum` nommé ⇒ ligne abstenue (montants null, hors Σ) ; résidus explicites |
| Dérive de spécification | vocabulaire interdit dans le code/texte | `gate:vocab` scope `sentinel` (cascade, Λ=0, would-have-alerted, reference-price) vert |

## Procurement (investisseur)
| Id | Document | Identité | Tentatives | Usage |
|---|---|---|---|---|
| PR-U1-1 | Perez, Werner, Xu, Livshits, *Liquidations: DeFi on a Knife-edge* | FC 2021, pp. 457-476 ; arXiv:2009.13235 ([lu web] titre/auteurs/venue ; **Eq. 3 non paginée = [abs]**) | PDF paginé à procurer | citation paginée de l'éligible statique (U-7) ; ŷ éligible = HF on-chain [lu] en U-4 |

## Conséquences
- **Positives** : premières étiquettes **réelles** décomposées (repayment / seized / déficit) par position, sha-pinnées et
  rejouables sans réseau ; source d'oracle par actif datée aux deux bornes ; U3-H1/H2/H3 mesurées et rapportées telles quelles.
- **Négatives (assumées)** : K = 3 événements ; un seul (e2, n=194) dépasse le seuil de Dunn 99 (α=0,01), et seulement avant
  stratification ; le déficit du cluster WETH est faible (~180 k$, 4 positions) — la majorité du bad debt de la fenêtre e2
  (24/28) vient d'autres collatéraux (`window_other`, hors périmètre) ; α et calibration = **U-4**. Sortie `annex` jusqu'à U-4.
