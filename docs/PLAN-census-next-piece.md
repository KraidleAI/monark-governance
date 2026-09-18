# PLAN — Census (A) liquidations Aave USDe-collatéral et (B) burns décomposés par brûleur — pré-enregistrement AVANT pull

> Rattachement : `docs/AUDIT-next-piece-2026-09-18.md` §4 (G0 de portefeuille), protocole F2-B (`PLAN-m008-f2b-usde.md` §5.0 : seuils fixés
> avant le pull complet), ADR-M008 D7bis (une clé par population, refus si dégénéré), ADR-M011 NDG-1. Go investisseur 2026-09-18 « go, enchaine ».
> **Mesure seulement : aucune calibration committée, aucune fixture de série, aucun texte public.** Sorties = JSONL bruts + rapport chiffré par
> census, sous `docs/census-2026-09-18/`. Lecture seule sur RPC publics (aucune clé), quorum 2 fournisseurs distincts (`providerOf`), C1 par fenêtre.

## Hypothèses pré-enregistrées (écrites avant le premier appel RPC)
- **A-H1** : sur Aave V3 Core mainnet, Σ `debtToCover` des `LiquidationCall` avec `collateralAsset ∈ {USDe, sUSDe, PT-sUSDe*, PT-USDe*}` est **≈ 0**
  sur toute fenêtre UTC depuis le listing, **y compris 2025-10-10/11** (oracle « Capped USDT/USD », vérifié on-chain 2026-09-18).
  Falsifie : ≥ 1 fenêtre avec Σ debtToCover ≥ 1 M USD-équivalent sur ce filtre.
- **A-H2** : sur le filtre `debtAsset = USDe`, des liquidations existent (collatéral autre), sans lien avec le file USDe : corrélation de rang
  (Spearman) entre y_t et v_t (timeline committée) sur les jours communs, |ρ| < 0,2.
- **B-H1 (FDUSD)** : un brûleur unique (Safe First Digital) porte ≥ 95 % des burns ; churn calme quotidien médian ≥ 0,5 %/j du stock ; run
  2025-04-03 ≥ 5 %/24 h ; C1 tient sur toutes les fenêtres. Seuils F2-B réutilisés : `ρ_min = 0,30`, `θ_stress = 1 %` de S_open, `S_floor = 10 M`.
- **B-H2 (sUSDe)** : `cooldownShares(shares)` émet `Transfer(owner → 0x0, shares)` sur `0x9d39a5de30e57443bff2a8307a4256c8797a3497` et fait
  décroître `totalSupply` ; `unstake` n'émet rien sur ce token. Si vrai : les burns de sUSDe = entrées dans la file (classe distincte).
- **B-H3 (USDtb)** : brûleur(s) ≤ 3, churn calme faible (médian < 0,2 %/j) ⇒ risque q̂ = 0 (msUSD inverse).
- **B-H4 (GHO)** : ≥ 70 % des burns (en montant, 90 j) viennent des aTokens/Pool (repay) ou de flash mint+burn même tx ; GSM < 20 % ⇒ refus
  comme population unique.

## Méthode
- Fenêtres UTC ancrées bloc via `apps/sentinel/src/windows.ts` (`daysUTC`, `firstBlockAtOrAfter`) — même implémentation que la sentinelle.
- (B) : `eth_getLogs` Transfer→0x0 et 0x0→ par fenêtre, `top byFrom` (motif `usde-full-pull.mjs:94-100`), détection mint+burn même tx (hash),
  `totalSupply` à la clôture, C1 = S_close + burns − mints == totalSupply(from_block − 1). Périodes : FDUSD 2025-01-01 → 2025-06-30 (run 04-03
  held-out) + 90 derniers jours ; sUSDe : 3 tx `cooldownShares` réels + 30 jours ; USDtb : 90 jours ; GHO : 90 jours.
- (A) : `eth_getLogs` topic `LiquidationCall` sur le Pool V3 Core (`0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2`), depuis le listing USDe
  (bloc à établir [lu] via l'événement `ReserveInitialized` ou la première `Supply`), décodage `collateralAsset`/`debtAsset`/`debtToCover`,
  agrégation par fenêtre UTC et par filtre ; conversion USD par `debtToCover` en unités du debtAsset (stables ≈ 1).
- Cross-check : une liquidation connue (bloc/tx à trouver dans un explorateur, copié avec sa source) doit apparaître dans l'agrégat.
- Interdits : toute exclusion non pré-enregistrée ; « aurait alerté N jours avant » ; toute phrase publique.

## Livrables
`docs/census-2026-09-18/{A-aave-liquidations,B-burners}.md` (chiffres, verdict par hypothèse, RPC utilisés, appels), JSONL bruts sous
`docs/census-2026-09-18/data/` (sha256 listés), scripts sous `scripts/census/` (réutilisables, jamais dans CI). R-25 par PR.
