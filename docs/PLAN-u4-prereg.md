# PLAN U-4a — pré-enregistrement (haché avant tout appel réseau)
Orchestrateur `claude-fable-5-1`, 2026-09-20. Lot U-4a (`docs/G0-lot-u4.md` + amendement checkpoint-1 C-1..C-13). Ce fichier est committé **seul**, avant le lancement du worker ; le script de course refuse de démarrer sans `--prereg-sha` égal au sha256 LF de ce fichier, et l'écrit dans `U4-inputs.jsonl` (`meta.prereg_sha`). Toute déviation est déclarée D-n dans le rapport, jamais absorbée.

## 1. Objet
Événement **e2** = liquidations Aave v3 core, collatéral WETH, 2025-10-10/11 (U-3 : `B_first = 23 545 088`, `B_last = 23 552 238`, 239 appels, 194 lignes, 189 comptes distincts). Book de référence **B₀ = 23 545 087** (cluster `weth`). Deux courses : (i) book complet à B₀ ; (ii) chemin d'oracle réalisé D_e = `AnswerUpdated` de l'agrégateur du feed WETH/USD (proxy `0x5424384b…`, `aggregator()` résolu à B₀ et à B_last) sur [B₀, B_last].

## 2. Définitions (C-1..C-4)
- Unité = **compte**. Y_compte = Σ (`repayment_base + deficit_base`) des lignes `U3-realized.jsonl` de l'événement e2 pour ce `user` (règle D-5 ratifiée). Y = 0 pour un compte éligible sous D_e non liquidé.
- ŷ_compte = `total_debt_base` du compte au book B₀ **si** HF(D_e) < 1, sinon 0. HF(D_e) = recompute WadRay du book (`wadray.ts`) avec les jambes WETH (collatéral **et** dette) au prix **p_min = min des `AnswerUpdated` sur [B₀, B_last]** et les autres actifs à leur prix de B₀ (limitation déclarée) ; LT de la réserve si `emode = 0`, sinon `getEModeCategoryData` (ajouté à la course) ou `non_evaluable` compté.
- Cellule e2 = {comptes du book B₀ avec ŷ > 0} ∪ {189 comptes liquidés}. Résidus comptés : `liquidated_not_in_book`, `liquidated_not_eligible_under_De`, `eligible_not_liquidated`.
- Score = |Y − ŷ| en base-monnaie 8 déc., **sans clipage**. α = 0,01 ; nMin = **100** (classe) ; p = ⌈(n+1)·0,99⌉ ; q̂ = p-ième plus petit score (= score maximal pour 100 ≤ n ≤ 198).
- `predictor_id = ukemi:realized-v1@eip155:1/aave-v3-core/weth/e2-2025-10-10` ; `task_class = liquidation-realized-given-oracle-path-24h`.

## 3. Hypothèses pré-enregistrées (testables, chacune rapportée tenue / non tenue avec le chiffre)
- **U4-H1** : nombre de détenteurs distincts d'aWETH (destinataires `Transfer` depuis `reserveInitBlock` 16 496 792 jusqu'à B₀, `balanceOf > 0`) ≤ **20 000**.
- **U4-H2** : les 189 comptes liquidés de e2 sont **tous** dans les comptes à risque du book B₀ (`balanceOf > 0` ∧ bit collatéral ∧ dette > 0).
- **U4-H3** : ŷ > 0 pour ≥ **90 %** des 189 comptes liquidés (sous D_e).
- **U4-H4** : ≥ **50** `AnswerUpdated` sur [B₀, B_last].
- **U4-H5** : ≥ **1** compte éligible sous D_e non liquidé dans la fenêtre.
- **U4-H6** : pour chacun des 107 blocs de prix WETH de `U3-inputs`, le dernier `AnswerUpdated` ≤ b vaut `getAssetPrice@b` (identité d'oracle).
- **U4-H7** : n = |cellule| ≥ 100.

## 4. Coût et garde-fous (C-5)
- Sonde **avant** la course : (a) énumération `Transfer` aWETH = ≈ 1 412 `getLogs` par opérateur ; (b) N détenteurs distincts ⇒ appels projetés ≈ N × (1 + k_coll + 2 + k_debt) × 2 ; écrits dans le PLI avant tout appel par compte.
- Plafond : **300 000 appels** toutes méthodes, **et** ≤ (quota Chainstack restant lu au dashboard par l'orchestrateur − 200 000 réservés Bell) ; `--max-calls` fail-closed, `--resume` (état hors dépôt), politesse par fournisseur ; durée projetée écrite ; dépassement projeté ⇒ arrêt et consultation, jamais un dépassement.
- Opérateurs : keyless `rpc2.ts` + `CHAINSTACK_ETH_URL` (env, jamais imprimé, `endpoints` publiés en `providerOf`). Quorum-2 par méthode, fail-closed.
- Contrôle indépendant : re-tirage G2 ≥ 3 comptes du book + ≥ 3 `AnswerUpdated`.

## 5. Ordre
1. Ce plan committé seul (sha LF consigné dans le PLI et `U4-inputs`).
2. A-1 (`--max-calls`, `--resume`, opérateur env) avec tests, hors ligne.
3. Sonde (a)(b) → chiffres au PLI → go/no-go sous plafond.
4. Course (i) book B₀ ; course (ii) D_e ; `getAssetPrice(USDT)@23550406` (C-12) ; `getEModeCategoryData` si e-mode ≠ 0 rencontré.
5. Réduction (`u4-scores.mjs`) → séries sha-pinnées → scores committés (`calibration.ts`, inertes) → adaptateur `fromRealizedBook` (C-6, 0 octet gelé) → Hikae nMin 100 → ADR-U4 → PLI.

## 6. Ce que ce lot ne fait pas
Aucun chemin servi (U-4b) ; aucune seconde classe (U-4c) ; aucune prédiction sur un autre événement ; aucun « Λ = 0 ».
