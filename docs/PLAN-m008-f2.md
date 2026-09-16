# PLAN — ADR-M008 F2 (Narabi : 1re calibration committée, run msUSD Main Street)

> G0 AgileGates (plan AVANT code). Rattachement : ADR-M008 D7/D7bis (pas de nouvel ADR). Statut : **PROPOSÉ**.
> Décision investisseur (2026-09-13) : **Option A** — calibrer la classe gelée en F1 `stable-run-velocity-24h`,
> **homogène 24h→24h**. `flow-redeem-1h` = **descripteur d'observation** (fiche produit / P-F-5), JAMAIS une
> `task_class` en code. Option B (classe 1h dédiée) = item D7bis ultérieur, hors F2.

## 1. Objet
Faire passer `stable-run-velocity-24h` de `under_calib`/abstain (F1) à **committée** : une calibration
split-conformal issue d'**outcomes réels** (l'épisode de run Main Street msUSD v2, cf. `PROCUREMENT-P-F-5`).
Barre « fini » (D7) : la classe **commit** sur un `calib_digest` reproductible + le run tenu **hors
échantillon** rejoue « aurait-elle parlé avant que le mid bouge ? ». Résultat négatif accepté.

## 2. Forme de calibration (A-homogène)
- **Fenêtre** = 24h. **Vélocité** `v_t = burns/(S_open·Δ)` = **fraction du stock d'OUVERTURE rachetée par heure** (ADR-M008 D4 amendé 2026-09-16, start-supply). `S_open = supply_close + burns − mints` (recalculé ; `supply` reste la clôture sur le fil, aucun changement de schéma). Ratio ≤ 1 hors churn (`mints > close`). `S_open ≤ 0` ⇒ `non_evaluable` ; `supply_close = 0` avec vrai drain ⇒ signal max (`v = 1/Δ`).
- **Prédicteur** = persistance (F1) : `v̂_t = v_{t-24h}`. **Paires homogènes** `(v̂_t, v_t)` sur des fenêtres 24h **consécutives**. **Score de non-conformité** `s_t = |v_t − v̂_t|`.
- **Ensemble de calibration = fenêtres CALMES uniquement** (de la naissance du token ~déc. 2025 jusqu'à AVANT le 15 juin 2026, hors toute fenêtre de stress antérieure). **Le run (15-20 juin) est TENU HORS ÉCHANTILLON** = jeu de test rétrospectif.
- **q̂** = `splitQuantile(scores_calmes, alpha, nMin)` (primitive HIKAE existante, statique, fail-closed). `nMin` défaut 50. **Si fenêtres calmes < nMin ⇒ `under_calib` honnête** (jamais de fabrication).
- **Exchangeabilité déclarée** : les scores calmes sont échangeables **dans le régime calme** ; le run est un régime distinct, d'où sa mise hors échantillon (cohérent D7bis « aucun modèle pooled »). C'est l'hypothèse centrale, écrite noir sur blanc.

## 3. Acquisition de données ([lu], sources AVANT travail — doc-03)
Cible (P-F-5 §0) : Main Street msUSD v2, token `0x4ba0…7C00`, minter `0x70C0…Ade14`. Par fenêtre 24h :
`burns` (Transfer → `0x0` / événements redeem), **`mints`** (nécessaire à `S_open`), `supply_close` (`totalSupply` à `to_block`), `[from_block, to_block]`.
- **Chemin** (à trancher, §7) : RPC + `eth_getLogs` (script HORS `src/tools/`, K-8) ; ou Dune ; ou export explorer. **Recompute vérifiable ⇒ [lu]**, jamais [2nd].
- **Fenêtre calme de référence** : de la naissance (~192 j avant le run) au 14 juin, **moins** toute fenêtre de stress antérieure (à identifier au pull).
- **Identité d'intégrité (C1, ADR-M008 D4)** : pour chaque fenêtre, vérifier `totalSupply(fin de from_block − 1) == supply_close + burns − mints` ; **fail-close sur écart** (oracle on-chain gratuit : attrape décimales, mauvais token/legacy, supply modifiée sans event Transfer). Bornage : `S_open` = `totalSupply` à la fin de `from_block − 1` (cohérent `eth_getLogs [from_block, to_block]` inclusif).
- **Cross-checks d'acceptation** (contre les [2nd] fournis) : Σ burns du run ≈ **10,8-11 %** de ~74,2 M ; jour-pic (17 juin) ≈ **4,26 %** ; 2 wallets ≈ 100 % du flux. Un pull qui ne les reproduit pas est **rejeté** (mauvais token / mauvaise fenêtre / décimales).
- **Artefacts** : fixture série (windows bruts) **sha-pinnée** + `PROVENANCE-msusd-run.md` + un **récorder reproductible** (`scripts/record-msusd-calib.mjs`, motif `record-h5`) qui recompute série → scores → `calib_digest`.

## 4. Branchement (hors zone gelée)
- Scores committés → **`apps/harness/src/calibration.ts`** (comme `BTC_DIR_CALIB` ; **PAS** `packages/contracts/src` ⇒ **aucune** re-baseline du manifest gelé) + un `MSUSD_CALIB_DIGEST` pinné (motif `CALIB_DIGEST_PINNED`).
- `stableRunVerdict` (gate.ts) : `conformInterval({calib: <scores committés>, …})` au lieu de `calib: []` ⇒ la classe **commit** quand `n ≥ nMin` et l'intervalle est assez étroit.
- **Honnêteté** : la phrase `STABLE_RUN_UNCALIBRATED_SENTENCE` cède la place à une phrase de **provenance réelle** (motif `BTC_DIR_CALIB_PROVENANCE`) : calibration **mesurée** sur l'épisode msUSD (déclarée réelle, PAS synthétique), l'échangeabilité et le hors-échantillon nommés. `honestyText` + `GATE_TOOL_DESCRIPTION` mis à jour ⇒ **re-pin trace h5** (dérive `tools/list`).
- **q99 côté appelant (D4bis) inchangé** : MONARK émet toujours commit/defer/abstain sur la couverture ; le seuil d'alerte reste caller-carried. Aucune modif d'enum / de contrat gelé.

## 5. Oracle F2 (anti-circularité)
- `calib_digest` == `calibDigest(scores)` recomputé indépendamment (boucle C1↔C2, motif F1b).
- **Quantile hand-rolled** dans le test (jamais via la primitive testée).
- **Test rétrospectif du run (hors échantillon)** : rejouer les fenêtres du 15-20 juin ; montrer que la vélocité franchit le **q99 calme historique** (règle D4bis, côté appelant) **AVANT** le mid public (≤ 20 juin) — « aurait parlé au jour −N ». Le mutant (calibration sur le run inclus) ⇒ rouge.
- Série validée contre les cross-checks §3. Fixtures jamais réécrites en test ; sha re-vérifié.

## 6. Recherche par classe (D7bis) — PRÉREQUIS avant de committer
Passe de lecture dédiée (biblio NARABI déjà soldée + doc-03) sur : dynamique de run/redemption au pair, et **validité du split-conformal statique sur une réalisation unique** (calme échangeable, run hors échantillon). Sortie : note qualifiant l'hypothèse d'échangeabilité et ses limites. **Résultat négatif accepté** (⇒ la classe reste `under_calib`).

## 7. Escalades / décisions ouvertes
- **E-F2-1 (chemin d'acquisition)** : RPC public `eth_getLogs` par un script (proposé, sans clé) vs Dune vs export explorer vs série fournie par l'investisseur.
- **E-F2-2 (dormance)** : à confirmer au pull — le token portait-il un flux représentatif pendant les ~192 j calmes ? Sinon le compte de fenêtres calmes chute (⇒ possiblement `under_calib`, honnête).
- **E-F2-3** : `alpha`/`nMin` de la classe committée (défauts caller-carried aujourd'hui ; F2 doit-il figer un défaut de classe ?).

## 8. Séquence AgileGates
G0 (ce plan) → **checkpoint-1 validateur** (plan) → acquisition [lu] (sources avant travail) + recherche D7bis → implémentation (calibration + branchement + tests) → **G2 fraîche** (≠ générateur) → **checkpoint-2 validateur** → **G7** → commit local (R-25). **Pas de push / pas de redéploiement VPS** tant que… F1+F2 verts (là, redéploiement candidat, sous permission investisseur, §3 ADR).

## 9. Barre « fini » F2
Classe `stable-run-velocity-24h` **committée** (calib_digest réel reproductible) OU `under_calib` honnête si données insuffisantes ; test rétrospectif du run vert (franchissement q99 avant le mid) ; quantile hand-rolled ; série [lu] validée ; G2 + checkpoint-2 verts ; zéro dette.
