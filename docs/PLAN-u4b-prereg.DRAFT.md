# PLAN-u4b-prereg — BROUILLON (U-4b-1b) : pré-enregistrement de la course de calibration sur épisode FRAIS, gel du code de score AVANT les données

> **STATUT : BROUILLON DE WORKER — NON COMMITTÉ, NON VÉRIFIÉ.** Sortie brute pour l'orchestrateur (R-21). **Le bandeau BROUILLON, la colonne « HEAD `430e99d` = `4ee3285` » du §2 et toute la section QUESTIONS sont à RETIRER ou RÉSOUDRE avant le commit : un prereg ne porte que des choix TRANCHÉS ; un blob committé avec des questions ouvertes n'est pas un prereg.**
> Cible du commit (par l'orchestrateur, SEUL, R-20) : `docs/PLAN-u4b-prereg.md`, committé **SEUL** (aucun code) **avant tout appel réseau** (ADR-U4b D4).
> **Provenance** : worker `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-21. Mission DOCS SEULEMENT, `F:\Monark` lu en lecture seule, écriture confinée à `F:\tmp\u4b-prereg\`, aucun réseau, aucun commit, aucun workflow. Mesures reproductibles dans `MESURES.md` (même dossier).
> **Base mesurée** : branche `lot/etude-suite`. **HEAD a AVANCÉ pendant ce tour** — `430e99d` (1ʳᵉ mesure) → `4ee3285e869bedf580fd29acaf00f134f884f37c` (2ᵉ mesure), commit concurrent d'un autre agent (`4ee3285` « G0 LANG-GATE-CI », touche **seulement** `docs/G0-lot-lang-gate-ci.md` — mesuré `git diff --name-only`, aucun fichier gelé touché). **Démonstration vivante du régime B / AM-1** : les 7 sha du §2 sont **byte-identiques aux deux HEAD**. Les sha sont recomputés depuis les **blobs HEAD** (ADR-U4b D4) et **seront recomputés à l'identique au commit réel du prereg** (à un HEAD futur ; toute divergence = ÉCART = STOP).
> **Écart de périmètre à trancher (voir QUESTION Q1)** : la mission énumère 8 items ; G0 §7 [C-12] exige que le prereg committé porte AUSSI §DISC (P-EPI), les définitions, H-0..H-7 chiffrées et la sonde go/no-go — sinon le prereg rate son objet anti-sélection (il ne fige pas la règle de sélection de l'épisode). Ces sections sont donc **reprises verbatim des sources adoptées** (G0 §2/§4/§6, plan plié accepté au checkpoint-1) et intégrées ci-dessous ; aucune n'est une décision du worker.

---

## (1) Objet et régime (D4)

**Objet.** Pré-enregistrer, AVANT tout appel réseau, (i) la règle mécanique de découverte de l'épisode FRAIS (P-EPI, §DISC), (ii) toutes les définitions et tous les choix de méthode à effet mesuré (liste fermée C-V-7, §3), (iii) les hypothèses H-0..H-7 avec critères de NON chiffrés, (iv) le protocole de budget/rapprochement Chainstack sous garde (A-4, §4-§6), et (v) **le GEL par sha du code de score et de sa fermeture transitive** (§2), afin que le code qui produira les scores frais soit figé AVANT que la donnée fraîche existe (anti « sélection sur l'issue » — le score-code ne peut être ajusté après avoir vu un q̂ flatteur). Motif U-4a (`PLAN-u4-prereg.md:2,30-34`, `ADR-U4:56`), repris par ADR-U4b D4.

**Régime (D4, régime B, ADR-C01 amendement cadence 2026-09-21).**
- Le prereg est committé **SEUL** (docs, exclu R-25) ; le script de course **refuse de démarrer sans `--prereg-sha`** == sha256 **LF** du blob committé du prereg (garde `lfSha256`, `record.ts:158` motif U-4a).
- **Preuve d'intégrité = blobs HEAD** (`git show HEAD:…`), **pas** `git status` (AM-1 du validateur : sous régime B, un pli concurrent peut écrire dans le même worktree ⇒ « `git status` propre » cesse d'être une preuve ; la preuve devient « blobs HEAD inchangés »). Commandes au §8.
- Toute déviation à l'exécution = **D-n déclarée au PLI**, jamais absorbée (P5).

**Préconditions dures du commit du prereg** (récapitulées, détail §7) : GARDE-HELIUS-2b-ii fusionné (arguments finaux du recorder) ; amendement ADR-U4b C-7 atterri (rpc.ts + « U-4b-0 subsumé ») ; C-15 (Mondrian 2003 [lu]) satisfaite ; E-I-3 confirmée close par la décision 108 ; `PR-U4-3-bis` si l'impl de l'épisode frais ≠ v3.5.0 (H-1).

---

## §DISC — Règle de sélection de l'épisode FRAIS, PRÉ-ENREGISTRÉE (verbatim G0 §2, [C-5]/[C-6], plan adopté au checkpoint-1)

Contrainte de fond (mesurée, `u3-realized.mjs:3-5,:40`) : le census A de U-3 n'a observé que **trois** clusters (`RAWLOGS_SHA=d0f4aa1e…`) — e1 (sUSDe), **e2 (WETH, jeu de CONCEPTION)**, e3 (sUSDe) — et seul e2 est WETH-collatéral. Un épisode FRAIS WETH n'est PAS pré-existant ⇒ U-4b **découvre** un nouveau cluster WETH (~280 k appels, décision 91). Règle fixée avant tout appel, committée seule.

**P-EPI — partition en pseudo-code EXACT (G2/le runner réimplémente depuis ce texte seul ; toute relaxation après H-0 NON = D-n déclarée)** :
```
# Entrées : B_lo, B_hi_rule, e2_window=[23545088,23557060], N_min (=50, ruling E-I-2)
B_lo        = 22803459                      # bascule feed WETH → proxy SVR 0x5424384b… (PR-U4-1:41,45) : sémantique D_e == e2
B_hi        = finalized - 64                # RÈGLE, pas un nombre : finalized lu à l'exécution, horodaté dans le brut de découverte
logs        = getLogs(Pool, [LIQ_TOPIC], B_lo, B_hi)      quorum-2   # LIQ_TOPIC = u3-realized.mjs:54 (auto-testé) — COMPTÉ AU BUDGET [C-19]
logs        = { L in logs : block(L) not in e2_window }            # e2 exclu : conception, jamais servi

# clustering VERBATIM la règle U-3 D2 (ADR-U3:30-31) :
for each L in logs ordered by (block, logIndex):
    if collateralAsset(L) != WETH: continue
    if L not yet assigned to a cluster:
        B_first = block(L)
        B_last  = firstBlockAtOrAfter( ts(B_first) + 86400 ) - 1     # windows.ts ; bloc jamais horodaté
        cluster = { M in logs : collateralAsset(M)==WETH and B_first <= block(M) <= B_last }
        residual_outside_window += { M : block(M) not in [B_first,B_last] }   # nommé, compté

# éligibilité d'un cluster candidat (seuils pré-enregistrés) :
eligible(cluster) :=
      collateralAsset == WETH
  AND B_last <= B_hi                                                          # fenêtre 24h COMPLÈTE ; sinon count PARTIEL ⇒ cluster écarté, résidu window_truncated compté [C-5]
  AND count(distinct liquidated accounts in cluster) >= N_min                 # N_min = 50 (E-I-2)
  AND version_ok(impl(Pool @ B_first))                                        # voir version_ok ci-dessous
candidats = { cluster : eligible(cluster) }

# choix (tie-break pré-enregistré, ruling E-I-1 = (i)) :
episode = argmin over candidats of B_first          # (i) PREMIER éligible chronologiquement (moindre sélection-sur-la-taille)
# tie-break secondaire (B_first égal, improbable) : plus grand count(distinct liquidated), puis address min

episode_id = "weth-" + date(B_first)
B_first, B_last, B0 = B_first - 1                    # écrits dans episode-selection.json, DÉRIVÉS des bruts (aucune main)
```
`episode-selection.json` est **reproductible depuis `(prereg_sha, brut de découverte)`** — asserté par `u4b_episode_selection_is_deterministic`. La borne haute mobile survit : la **règle** est figée, la **donnée** (`finalized`) est horodatée dans le brut.

**Éligibilité de VERSION** (v3.6.0 publié 2026-01-08 ⇒ la plupart des clusters frais post-`B_lo` sont v3.6.0) :
```
version_ok(impl) :=  (impl == v3.5.0  0x97287a4f…)                                   # cas nominal
                 OR  (impl_diff_LiquidationLogic_sol_lu_et_declare_NEUTRE(impl))     # cas frais réaliste
```
Les **5 constantes** close factor sont identiques v3.3.0→v3.7.0 (`PR-U4-3:159-160`, `SYNTHESE.md:22`) ; le risque porte sur la **logique** (v3.6.0 = 79 lignes de diff). ⇒ **`PR-U4-3-bis` (lire `LiquidationLogic.sol` de l'impl effective au niveau [lu] et déclarer le diff NEUTRE pour le close factor) est une PRÉCONDITION** de tout ŷ sur un épisode v3.6.0 (H-1). Plage census A : découverte `[B_lo=22803459, finalized−64] \ e2` ; énumération détenteurs aWETH `16496792 → 23545087`, chunk 9 990, ≈ 1 412 getLogs/opérateur (`CHECKPOINT1-lot-u4:34`, `PLAN-u4-prereg.md:24`).

---

## Définitions pré-enregistrées (renvoi ADR-U4b D1/D2/D3 ; committées dans le prereg)

- **Unité** = compte **mono-collatéral WETH** à B₀ : `collat_non_WETH_base(p0)/total_collateral_base(p0) ≤ X`, **X = 0** (lecture stricte, décision 91). e-mode hors {0,1} ⇒ fail-closed (exclu). LST = catégorie e-mode 1 ∧ ≠ WETH (rsETH hors) ; dette LST tenue à p0 (`lst_debt_at_p0`). Ancre pré-B₀ : `AnswerUpdated ≤ B₀` réel (source du parcours de D_e).
- **Étiquette Y** = ADR-U3 (labeling paramétré, réutilise `u3-realized.mjs` sans le figer sur e1/e2/e3). `toBase` de Y = **floorDiv** [lu, mesuré blob HEAD : `floorDiv(BigInt(amount)·BigInt(price), 10n**BigInt(dec))`, `u3-realized.mjs:101-104`]. **`u3-realized.mjs` est MODIFIÉ en -1b** (paramétrage, G0 1b-3) ⇒ il ne peut être gelé entier ; or la convention de conversion de Y (floor) est **load-bearing** pour les scores `s=|Y−ŷ|`, l'entrée C-V-7 « score en devise de base » et le ruling CA (a) (symétrie Y/ŷ) — **trou anti-sélection côté Y, voir Q11**.
- **ŷ = maximum liquidable en UN appel, au PREMIER FRANCHISSEMENT p\*** (ADR-U4b D2 ; règle v3.5.0 [lu] `PR-U4-3`, tag `6138e1fda…`) : `ŷ = max_r min(CF(HF), C_r/m_r)` sur les réserves de dette r (multi-dettes = **max**, jamais Σ), `CF_base = min(D_r, 0,5·D_tot)` si `C_r ≥ 2000e8 ET D_r ≥ 2000e8 ET HF(p*) > 0,95e18` (strict) sinon `D_r` ; `CA = floor(C·1e4/bonus)` ; `MustNotLeaveDust` en **OU** ; `m` (bonus) lu de la **réserve** / de `emode_raw` (C-14), **non figé par le prereg** — valeurs mesurées sur e2 : 10 100 (e-mode) / 10 500. Convention **`D_tot(p*) = total_debt_base − vWETH@p0 + vWETH@p*`** (agrégat on-chain autoritaire, précédent ADR-U1 C-2). Score/ŷ en **devise de base 8-dec** (pas floor natif Solidity), convention floor partagée avec `toBase` de Y.
- **Score, α, nMin, Mondrian** (ADR-U4b D3) : split-conformal `s = |Y − ŷ|`, sans clipage, tri canonique ; `q̂` = p-ᵉ plus petit, `p = ⌈(n+1)(1−α)⌉`, **α = 0,01**, **nMin = 100** par strate (Dunn 2022 Thm 11, strict) ; strates de la classe A par taille de ŷ aux frontières **du code** : `< 2000e8`, `[2000e8, 100 k$)`, `[100 k$, 1 M$)`, `≥ 1 M$`. En **couverture**, jamais en probabilité (vocabulaire gaté). Précondition C-15 (Mondrian 2003 [lu], `alrw.net/old/04.pdf`) : validité par catégorie sans taille minimale, κ fixée A PRIORI.
- **Classes** : **A** `liquidation-eligible-coverage` = {ŷ > 0 sous D_e} ∪ {liquidés} — **la seule SERVIE** (décision 108) ; **B** `liquidation-realized-given-liquidated` = liquidés — **calculée hors ligne, JAMAIS servie**. Le code gelé émet les lignes des DEUX cellules sur toute donnée (le gel précède la donnée ET l'escalade E-I-3) ; -2 décide seul ce qui est servi.

---

## H-0..H-7 — hypothèses avec critère de NON et valeurs chiffrées (verbatim G0 §2/§4, [C-11])

- **H-0 (existence)** : ≥ 1 cluster WETH éligible dans `[B_lo,B_hi] \ e2`. **NON ⇒** arrêt `no_fresh_episode`, **item formé** (élargir la fenêtre / abaisser N_min = décision investisseur), **AUCUNE course**. Toute relaxation post-NON = **D-n déclarée au PLI**.
- **H-1 (version)** : impl @B_first `== v3.5.0` OU diff [lu]-neutre. **NON (diff non lu) ⇒** course **EN PAUSE**, `PR-U4-3-bis`.
- **H-2 (n/strate)** : n(strate) ≥ nMin ; **NON ⇒** strate `under_calib` (comptée).
- **H-3 (échangeabilité INTER-épisodes, falsifiable)** : appliquer le q̂ FRAIS à la cellule e2 ⇒ **couverture empirique** ; critère de **NON : couverture `< 0,99 − k·SE`**, `k` **proposé = 2** (choix de conception, à ratifier), `SE` de `Beta(p, n−p+1)` de l'épisode FRAIS. NON ⇒ écart inter-épisodes **en chiffres** (Σ w̃·d_TV, Barber 2023), **aucune revendication sur un nouvel événement** (K=2 ≪ 99 à α=0,01). **Texte servi (C-11)** : « un OUI de H-3 ne licencie rien de plus » ; **mutant de sur-revendication ⇒ ROUGE** (`gate.ts:498`).
- **H-4 (multi-appels)** : seuil `k_H4` **proposé = 5 %** (à ratifier) ; NON ⇒ sous-prédiction déclarée par strate (ŷ = un appel ; Y = Σ des remboursements 24 h).
- **H-5 (population)** : #comptes mono-collatéral WETH ≥ `k_H5` **proposé = nMin = 100** (à ratifier) ; rapporté.
- **H-6 (série SERVIE)** : valeur d'oracle servie ∈ série `AnswerUpdated` + borne de retard 1–3 events ; NON ⇒ p_min re-défendu par encadrement.
- **H-7 (identité)** : à p\*=p0, `HF == hf0` EXACT ; mutant LT_W←0 ROUGE.

**Note doc 03 [C-11]** : `k=2`, `k_H4=5 %`, `k_H5=100` sont des **choix de conception avec rationale, proposés à ratification** (ce prereg est leur point de ratification — voir QUESTION Q6) — **jamais des faits sourcés**. **Établis** : `X=0` (ratifié C-V-7), `N_min=50` (E-I-2), tie-break (i) (E-I-1), `α=0,01`, `nMin=100`, coupes `{2000e8, 100k$, 1M$}` (rulings/constantes du code).

---

## (2) Tableau des sha GELÉS — recompute depuis les blobs HEAD et comparaison à l'ADR

**Méthode (par fichier, régime B)** : `git -C F:/Monark show HEAD:<path> | tr -d '\r' | sha256sum`. Recomputé aux DEUX HEAD de ce tour (`430e99d` puis `4ee3285`), **valeurs identiques**. Sorties brutes reproductibles dans `MESURES.md`. **Ces sha seront recomputés à l'identique au commit réel du prereg** (si un commit ultérieur touche un fichier gelé ⇒ ÉCART = STOP, voir Q10).

| # | Fichier gelé | sha256 LF recomputé (HEAD `430e99d` = `4ee3285`) | Référence ADR-U4b D4 / C-V-2 | Verdict |
|---|---|---|---|---|
| 1 | `scripts/census/u4b/u4b-scores.mjs` | `9ad20666af878c630073d998c6d3bc0bca38017e73b406853bcc31c3f83feacf` | `9ad20666af878c630073d998c6d3bc0bca38017e73b406853bcc31c3f83feacf` (D4, complet) | **CONCORDANCE** |
| 2 | `scripts/census/u4b/u4b-reduce.mjs` | `a5e66cd387279f4696f09853633a553840dadc53979f78b94aa6f9af57a6fac0` | `a5e66cd387279f4696f09853633a553840dadc53979f78b94aa6f9af57a6fac0` (D4, complet) | **CONCORDANCE** |
| 3 | `scripts/record-u4b-calib.mjs` | `5733daeb7c8ee40ab0a657882bbe1a9bd03a00d4ddab99e01cfa052a1fbc31a3` | `5733daeb7c8ee40ab0a657882bbe1a9bd03a00d4ddab99e01cfa052a1fbc31a3` (D4, complet) | **CONCORDANCE** |
| 4 | `apps/sentinel/src/ukemi/wadray.ts` | `7bee76fc96a9bc23bb5869ba89167ef58c0f1e8481ed0467ed445c0ee4de2322` | `7bee76fc…` (D4/C-V-2, préfixe) | **CONCORDANCE (préfixe ADR)** |
| 5 | `apps/sentinel/src/ukemi/abi.ts` | `3376eb084f522cb25d708369efb9bc9d11f7b4598abdf4f36708bfd2c1ab2d66` | `3376eb08…` (D4/C-V-2, préfixe) | **CONCORDANCE (préfixe ADR)** |
| 6 | `packages/hikae/src/l1-split.ts` | `9206df9189d3eba6af61ba3f4a0981b08d80b63f99d171ad3e5a01958164ffa3` | `9206df91…` (D4/C-V-2, préfixe) | **CONCORDANCE (préfixe ADR)** |
| 7 | `apps/sentinel/src/rpc.ts` | `0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0` | **AUCUNE VALEUR ADR** (ajout addendum GARDE-HELIUS-2 C-3 / kit de passation §9.5 ; ADR-U4b D4 ne l'énumère pas — voir Q3) | **VALEUR À FIGER (nouvelle)** |

**Bilan : aucun ÉCART sur les 6 fichiers référencés par l'ADR (3 complets identiques, 3 préfixes concordants) ⇒ pas de STOP sur le front sha.** Le 7ᵉ (`rpc.ts`) n'a pas de valeur ADR à comparer : le prereg le **fige à `0e232519…`** (ce n'est pas une « concordance »).

**Fermeture transitive vérifiée (mesurée ce tour, greps dans `MESURES.md`)** — le jeu gelé est **fermé** sur `apps/**/src` + `packages/**/src` (hors builtins Node et `@monark/contracts` = `packages/contracts/src/calib-digest.ts`, déjà couvert par `contracts_frozen`) :
- `u4b-scores.mjs` importe `wadray.ts` (`percentMul`) + `abi.ts` (`decodeEModeCategoryData`) ;
- `u4b-reduce.mjs` importe `abi.ts` + `u4b-scores.mjs` ;
- `record-u4b-calib.mjs` importe `@monark/contracts` (`calibDigest` → `calib-digest.ts`, contracts_frozen) + `@monark/hikae` (`splitQuantile` → `l1-split.ts`, gelé) ;
- `abi.ts` importe `../rpc.ts` (`TRANSFER_TOPIC`, constante littérale `rpc.ts:15`) ;
- `wadray.ts`, `l1-split.ts` : **aucun import** (feuilles pures) ; `rpc.ts` : n'importe que `node:crypto` (feuille).
⇒ closure = {u4b-scores, u4b-reduce, record-u4b-calib, wadray, abi, rpc, l1-split} ∪ {calib-digest (contracts_frozen)}. Aucun import `src` non gelé restant. (La revendication anti-sélection C-V-2 est ainsi complète, sous réserve Q3.)

---

## (3) Liste fermée C-V-7 des choix pré-enregistrés (verbatim) + ruling d'arrondi CA (a) + écart 3/565

### (3a) C-V-7 — liste fermée, effet mesuré (VERBATIM `docs/CHECKPOINT2-lot-u4b-1a.md` §C-V-7 ; source à effets mesurés, pas la liste compressée de l'ADR D4)

> « X=0 exact (6 611 exclus, dont 483 sub-$1, C-V-4) ; e-mode fail-closed hors {0,1} (33) ; LST = emcat 1 ∧ ≠ WETH, rsETH hors, dette LST tenue à p0 (105 comptes, Σ|Δŷ| ≈ $695) ; tie-break dust = premier dans l'ordre des balances (`dust_bounded` seul) ; scale 1 ; score en devise de base vs floor natif (C-G2-3 a) ; `CA` en division floor (C-G2-3 b, `PR-U4-3-ter` formé) ; **convention D_tot (C-V-1)** ; `>` strict sur 0,95e18 asserté par lecture, non discriminable sur e2 (0 compte à l'égalité). »

**Précision C-V-4 (correction doc 03, verbatim CHECKPOINT2)** : « 483 résidus sub-$1 = rounding » est **faux** ; histogramme mesuré : 5 résidus ≤ 5 unités, 16 dans 6–100, 135 dans 101–1e4, 199 dans 1e4–1e6, 128 dans 1e6–1e8 ⇒ 478/483 sont de **vrais collatéraux non-WETH minuscules**, pas du rounding (ce chiffre informe la ratification X=0 : la lecture stricte est la bonne).

**Convention D_tot (C-V-1) — les DEUX mesures d'effet, pour être vérifiable** :
- Convention Σ jambes (floor) vs convention du code : déplace **140/565 ŷ** de ±1–2 unités, **1 p\*** (compte dust `0x01a7bb45…`) et le digest (CHECKPOINT2 M-3 ; mutant `dtot` ROUGE).
- Variante cohérente « Σ ceil, WETH repricé » vs convention du code : **0/565 ŷ changés, 0 p\* changé, q̂ identiques** ([mesuré] advisor-defi §2, rejeu du code gelé reproduit le digest A `dc9ab572…`, n=565). ⇒ la convention D2 gelée équivaut à la convention de principe sur e2.

### (3b) « agrégat ≠ Σ jambes » (item G7 formé, déclencheur « avant la course -1b ») — EXPLIQUÉ par lecture [lu]

Constat brut (C-V-1 b) : `total_debt_base` > Σ floor(amt·prix/unit) de **+1..+5 unités pour 564/565** comptes de la cellule A (CHECKPOINT2 M-3 : +1 (454), +2 (93), +3 (16), +5 (1)). **Explication mesurée + lue** :
- [mesuré] `total_debt_base == Σ_jambes ceil(montant·prix/unité)` pour **16 092/16 092** comptes à dette, dont 565/565 en cellule A ; la variante demi-arrondi ne colle que sur 6 959/16 092 (rejetée) — advisor-defi §1.
- [lu, WebFetch, tag-pinné] `GenericLogic._getUserDebtInBaseCurrency = MathUtils.mulDivCeil(...)` ⇒ **dette au PLAFOND** en devise de base ; collatéral `= balance/unité` ⇒ **troncature** ; changelog officiel v3.5.0 tag-pinné : « rounded up » pour la dette, « rounded down » pour le collatéral, « always round in favor of the protocol » — **ceiling de la dette INTRODUIT à v3.5.0** (RAPPORT-lecteur PR-U4-3-ter Q5). **Niveaux à ne pas niveler** : `mulDivCeil` est nommé via WebFetch, numéros de ligne approximatifs, `MathUtils.mulDivCeil` elle-même **NON LUE** ; la **preuve dure est l'identité mesurée 16 092/16 092**.
- ⇒ l'agrégat `total_debt_base` (grandeur du contrat, `PR-U4-3` l.265) EST le ceil-par-jambe ; la convention D2 gelée l'utilise. **Statut : expliqué ; la clôture formelle de l'item reste à l'orchestrateur** (touche le book U-4a, zone `034fbff9`).

### (3c) Ruling d'arrondi CA (a) — RECOMMANDATION advisor-defi, VERBATIM (à pré-enregistrer en C-V-7)

`ca_binding` (comptes où le collatéral borne la liquidation) = **3/565**, tous en strate 0, non liquidés, dette d'actif à 8 décimales, ŷ de 6 chiffres (moins d'un centime) :

| compte | Δŷ, plafond en devise de base | Δŷ, chemin natif fidèle (troncature native → plafond → `toBase` floor) |
|---|---|---|
| `0x269cfb59…` | +1 | −85 632 |
| `0x3a30e718…` | +1 | −106 302 |
| `0xc0ab9bc7…` | +1 | +3 683 |

Dans toutes les variantes : **Δq̂ = 0, zéro changement de strate, zéro p\* changé** (advisor-defi §4).

> **Recommandation (a) — texte à pré-enregistrer en C-V-7 (verbatim advisor-defi §4)** : « ŷ en devise de base, convention floor partagée avec `toBase` de Y ; écart au chemin natif du contrat ≤ 1 quantum natif de l'actif de dette + 2 unités ; mesuré sur e2 : 3/565 comptes, max |Δ| = 106 302 unités, q̂ inchangés ».

**Provenance du ruling (a)** : `PR-U4-3-ter` formé et **rendu 2026-09-21** — FAITS (lecture sur place orchestrateur, `PR-U4-3-ter-FAITS-arrondi-CA-2026-09-21.md`) + RAPPORT lecteur `claude-sonnet-5` (`percentDivCeil` = plafond confirmé [lu]) + AVIS advisor-defi `claude-fable-5-1`. **(b) « chemin natif complet »** (bit-fidélité) était déclaré « impossible honnêtement » quand `percentDivCeil` était NON LU ; il est désormais lu ⇒ **une des trois conditions de bascule vers (b) est remplie** (« la lecture arrive avant le gel ») ; les deux autres (préférence investisseur pour la bit-fidélité sur la symétrie Y/ŷ ; Y re-dérivé par la même convention) **ne le sont pas**. ⇒ **(a) reste le défaut sourcé** ; la bascule est une décision de valeur — voir QUESTION Q4 (le worker ne tranche pas).

---

## (4) Protocole agrégat Chainstack A-4 (verbatim ADR-GARDE-HELIUS A-4) + créneaux exclus calculés

**Mode et nœud** : `runReconcile(..., mode="aggregate-calibration")` ; **1ʳᵉ course Chainstack = ÉTALONNAGE** ; hypothèse **nœud Global CONFIRMÉE** (console Statistics, classification PAR REQUÊTE, A-1) ⇒ le tarif conservateur (2 RU par méthode du recorder) est la règle des CAPS. En `aggregate-calibration` : la **borne dure BLOQUE** (exit 1 si `Δtotal_ru > Σ ledger_run`) mais l'écart **souple est CONSIGNÉ** (`softDeviation`, exit 0) au lieu d'un NO-GO souple ; la bande de la 2ᵉ course est pré-enregistrée depuis ce `softDeviation`.

**Protocole (A-4, couche règles ; les INSTANCES vont au prereg, épinglées par sha)** :
- **(i)** fenêtre d'une **JOURNÉE entière** ;
- **(ii)** **double lecture de stabilité** de `after` APRÈS le délai de mise à jour (« Data updates every few hours », FAITS pt 10) — deux lectures identiques espacées ; **l'espacement est une INSTANCE à remplir à la course** (« heures de lecture »), non inventé ici ;
- **(iii)** **aucun chevauchement** d'une **fenêtre before/after de rapprochement** avec l'heure d'un créneau du job quotidien Narabi (addendum C-4 verbatim : « aucune fenêtre before/after de rapprochement Chainstack ne chevauche l'heure d'un créneau du job quotidien ») — la fenêtre A-4(i) étant une journée entière, elle contient forcément les 4 créneaux ; ce sont les **instants de lecture** before/after qui les évitent ;
- **(iv)** le résiduel Narabi du jour soustrait est un **MINORANT** (borne inférieure) de la consommation Narabi, lu au **journal du sentinel** (nombre d'appels Chainstack du jour) — un résiduel surestimé cacherait un contournement.

**Instances portées par le prereg (A-4)** : jour, heures de lecture (les deux de (ii)), floor (`--floor`, lu au dashboard avant la course), chiffre du résiduel Narabi, **sha du journal du sentinel**. Un opérateur sans dashboard par méthode (`AGGREGATE_ONLY_OPERATORS = {chainstack}`) EXIGE `--mode aggregate|aggregate-calibration` au CLI, fail-closed avant tout verrou.

**Créneaux exclus — CALCULÉS depuis les créneaux fournis** (donnée orchestrateur : Narabi 00:30 / 03:30 / 06:30 / 09:30 UTC, durée + 30 min ; **à RECONFIRMER au journal du sentinel au moment de la course** — le worker n'a mesuré ce tour que « run publiant de 00:48 UTC » + « 4 créneaux/jour », addendum C-4). Fenêtres d'exclusion des **instants de lecture** before/after (UTC) :

| Créneau (début) | Fenêtre exclue (début + 30 min) |
|---|---|
| 00:30 | **00:30 – 01:00** |
| 03:30 | **03:30 – 04:00** |
| 06:30 | **06:30 – 07:00** |
| 09:30 | **09:30 – 10:00** |

⇒ les lectures before/after (et la double lecture (ii)) se placent **hors** de ces 4 fenêtres, ET après le délai de mise à jour du dashboard. (00:48 mesuré tombe bien dans [00:30–01:00], cohérent.)

**Corollaires** : overage Chainstack DÉSACTIVÉ (A-5, « Extra usage: Disabled ») ⇒ à quota atteint Chainstack ARRÊTE le service (dont Narabi), pas de facture ; le cap 16 M RU protège la disponibilité de Narabi. Quota mensuel exact et prix d'overage : **NON LU** (procurement formé si une course approche 16 M RU).

---

## Sonde AVANT la course (go/no-go, verbatim G0 §6, écrite au PLI avant tout appel)

- **(a)** énumération `Transfer` aWETH ≈ **1 412 getLogs/opérateur** ;
- **(b)** appels projetés `≈ N × (1 + k_coll + 2 + k_debt) × 2` ;
- **(c)** sonde getLogs large **Pocket L-5** (précondition de POOL-RPC-1a L-3 branche B) ;
- **(d)** **1 `eth_call` `s_cutoffTime()` @B_fresh sous garde** (E-I-7 = OUI) ;
- **(e)** **distinct-par-groupe `{nodies, pocket} = 1` ≥ 2/méthode** [C-3] (la sonde ne suppose PAS que le code fusionné porte la règle de groupe ; elle l'asserte fail-closed) — **vérifié AVEC `--exclude-operators mevblocker` appliqué** : ETH_CALL = {drpc, {nodies, pocket}} = **exactement 2 groupes, marge nulle** (`u4-oracle-path.mjs:56-57,127` exclut déjà `mevblocker.io`) ; **part Chainstack projetée** (Σ appels payants / total), **plafond**, **règle d'arrêt** (dépassement projeté ⇒ arrêt + consultation).
- **Discipline secret** : `archive-env`, jamais URL/clé ; **CGU de la source lues avant tout appel d'API de données** (règle 2026-09-20).
- **Budget** : la découverte (§DISC) est **comptée au budget** [C-19]. Projection d'ordre : ~280 k appels (décision 91) × 2 RU/appel (recorder = méthodes 2 RU, A-1) ≈ **~560 k RU** projetés (**projection à raffiner par la sonde**, ≪ cap de cycle 16 M RU). Le plafond de run `--max-ru` et le rapprochement « ≤ quota restant − 200 000 réservés Bell » (G0 §6, exprimé en appels avant migration) sont **à confirmer en RU au commit** (unité de la réservation Bell sous comptabilité RU à fixer — voir Q7).

---

## (5) Arguments du recorder gardé (à confirmer au commit) + `reconcile` + `--concordance-out`

**Deux surfaces CLI distinctes** (ne pas confondre — advisor) :

**(5a) Recorder de la course** (`runRecorder`, GARDE-HELIUS-2 D4 ; **arguments finaux SEULEMENT après GARDE-HELIUS-2b-ii** — noms actuels, **à confirmer au commit**) :
- `--ledger-dir <hors dépôt>` (ledger de cycle, `F:\monark-ledger\<cycle>\`) — REQUIS ;
- `--cycle <id>` (cycle Chainstack) — REQUIS ;
- `--floor <RU>` (floor lu au dashboard avant la course) — REQUIS (D4(i)/C-2) ;
- `--max-ru <RU>` (cap de run en RU, par opérateur/unité) — REQUIS ;
- `--method-caps <table>` (fail-closed par méthode ; méthode absente ⇒ refus) — REQUIS ;
- `--max-calls <n>` (cap de run en appels, conservé) — REQUIS ;
- `--exclude-operators mevblocker` (G0 §5 [C-2] : **mevblocker exclu de la course**, D-5 — sourcé, pas une décision) ;
- `--concordance-out <chemin hors dépôt>` (couture `runRecorder` de POOL-RPC-1a C-5/C-6 ; **déclencheur réel du producteur de concordance**, décision 100 ; note orchestrateur G0-lot-u4b `:362`) ;
- `--prereg-sha <sha256 LF du prereg committé>` (garde `lfSha256` ; le script refuse sans lui, D4).

**(5b) `reconcile` servi** (`runCli reconcile`, ADR-GARDE-HELIUS D4/A-4) : `--before <snap>`, `--after <snap>`, `--cycle <id>`, **`--mode aggregate-calibration`** (le `--mode` est un argument de `reconcile`, PAS du recorder). `CliDeps.floor` reste scalaire (CLI mono-opérateur).

**Ordre des fournisseurs ÉPINGLÉ** (invariant, `rpc2.ts:268-269`, mesuré ce tour) : `ETH_CALL_PROVIDERS` = [drpc, mevblocker, nodies, pocket] ; `GET_LOGS_PROVIDERS` = [drpc, mevblocker, tenderly, pocket]. Les scripts de course importent cet ordre de `rpc2.ts` (source UNIQUE : `u4-oracle-path.mjs:21`, `u4-probe.mjs:29`), pas une copie ; les census d'AUTRES campagnes (`aave-liquidations.mjs`, `burns-by-burner.mjs`) portent leurs propres listes (hors périmètre). **Après GARDE-HELIUS-2b (post-migration)**, ces URL deviennent des labels résolus (`ETH_CALL_KEYLESS_LABELS`/`GET_LOGS_KEYLESS_LABELS`), ordre identique, `book_digest` inchangé, et `CHAINSTACK_ETH_URL` n'est lu que dans `transport.ts`. **Au HEAD mesuré, `record.ts:17,328-330` importe ENCORE les URL de `rpc2.ts` et lit `CHAINSTACK_ETH_URL`** (addendum C-3 fait 1 — état à confirmer post-2b).

---

## (6) Critères GO / STOP

**Séquence de fin de course (verbatim protocole ADR-GARDE-HELIUS D4/C-V-4 + addendum §Protocole)** :
1. **`unlock` (N)** — relâcher **CHAQUE opérateur demandé** (A-2 : tous les opérateurs demandés, payants ET keyless, sont verrouillés en début de course ; 2b « relâche tous les opérateurs demandés en fin de course ») : `chainstack` + les 5 labels keyless ETH (drpc, mevblocker, nodies, pocket, tenderly), **une ligne `unlocked` chaînée chacun**. (Un `reconcile` lancé sous verrou tenu ⇒ `LockHeldError`, exit ≠ 0, C-V-4 ⇒ `unlock` D'ABORD.)
2. **`reconcile --mode aggregate-calibration`** — **GO ssi `Δdashboard ≤ ledger_run`** (borne DURE ; ici `Δtotal_ru ≤ Σ ledger_run` en RU conservateurs, mode agrégat). Bande **souple** `ledger_run − Δ ≤ max(50 RU, 0,5 % du run total)` (décision 113 / addendum C-1) : en `aggregate-calibration`, **CONSIGNÉE (`softDeviation`), non bloquante** (sert à pré-enregistrer la bande de la 2ᵉ course). `Δdashboard > ledger_run` ⇒ **NO-GO dur** ; `Δ` négatif (compteur journalier remis à zéro) ⇒ **NO-GO `negative_delta`** ; rollover de cycle (`before.cycle ≠ after ≠ --cycle`) ⇒ NO-GO.

**Plafonds anti-BUG fail-closed (décision 119, ne sont PAS levés par le GO durable)** :
- **Chainstack 16 M RU / cycle** (décision 115) — pertinent pour cette course ;
- Helius 8 M cr / cycle (décision 112) — cité par 119 mais **inapplicable ici** (une course Ukemi ne verrouille jamais `helius`, A-2) ;
- caps de run/méthode (`--max-ru`, `--method-caps`) ;
- **plafond touché ⇒ STOP + retour investisseur** (« peu importe le coût » n'autorise pas une dépense par défaut logiciel — leçon HELIUS-1). Aucun gate suspendu (R-22) ; aucune règle de sécurité (secrets, pages à clé, aucun script de brouillon sur endpoint payant).

**GO durable amont (décision 119)** : la course Ukemi U-4b-1b (~280 k appels) a le GO **dès GARDE-HELIUS-2 fusionné, prereg committé seul, rapprochement before/after** — sans nouveau go.

---

## (7) Ce que le prereg NE décide PAS

- **Hors décision 119 (« un go propre le moment venu »)** : course de contre-vérification **Bell** (~5,4 M cr) et question C-F-4 ; course **live U-6** ; mise en ligne du site (décision 101) ; go DNS Bell ; tout achat ou action de compte. **Le prereg U-4b-1b ne les couvre pas.**
- **Le q̂ et les intervalles** : produits par la course, jamais pré-décidés (c'est l'objet du gel).
- **L'épisode frais lui-même** : découvert **mécaniquement** par P-EPI (§DISC) ; le prereg fige la RÈGLE, pas l'épisode.
- **Le résultat H-3** (échangeabilité inter-épisodes) : mesuré, non pré-décidé ; un OUI de H-3 ne licencie rien de plus.
- **La classe SERVIE en -2** : **A seule** (décision 108) — le prereg pré-enregistre que le code gelé émet A ET B, mais seule A est servie ; -2 (branchement) est un lot séparé.
- **La bascule CA (a)→(b)** : décision de valeur (Q4), non tranchée par le worker.
- **La neutralité de version** si l'épisode est v3.6.0 : `PR-U4-3-bis`, précondition (H-1), non pré-décidée.

**Préconditions dures AVANT le commit du prereg** (récap, chacune un item formé à déclencheur — jamais un dû nu) :
1. **GARDE-HELIUS-2b-ii fusionné** ⇒ arguments recorder finaux (§5a) ; le prereg est re-vérifié contre la signature CLI fusionnée avant commit.
2. **Amendement ADR-U4b C-7 atterri** : rpc.ts au gel D4 + « U-4b-0 subsumé » en D5 (aujourd'hui absents du texte ADR au HEAD `430e99d`) — Q3.
3. **C-15 (Mondrian 2003 [lu])** : SATISFAITE (note orchestrateur G0-lot-u4b `:358`, lecteur `claude-sonnet-5`, `alrw.net/old/04.pdf`).
4. **E-I-3** confirmée close par la décision 108 (ADR-U4b la cite ; G0 §12 la disait encore « en attente ») — Q8.
5. **`PR-U4-3-bis`** si l'impl de l'épisode découvert ≠ v3.5.0 (H-1).
6. **Procurement `PR-U4-4-a`** (chapitre Mondrian du livre 2022, ISBN 978-3-031-06648-1) : formé, non bloquant (substitut 2003 [lu]).

---

## (8) Preuve d'intégrité sous régime B (commandes)

**Principe (AM-1)** : sous régime B, un pli concurrent peut modifier le worktree ⇒ « `git status` propre » **n'est PAS** une preuve d'intégrité ; la preuve est « **blobs HEAD inchangés** ».

**(8a) Recompute des 7 sha gelés** (à rejouer au commit ; toute divergence vs §2 = ÉCART = STOP) :
```
for f in \
  scripts/census/u4b/u4b-scores.mjs \
  scripts/census/u4b/u4b-reduce.mjs \
  scripts/record-u4b-calib.mjs \
  apps/sentinel/src/ukemi/wadray.ts \
  apps/sentinel/src/ukemi/abi.ts \
  packages/hikae/src/l1-split.ts \
  apps/sentinel/src/rpc.ts ; do
  echo "$(git -C F:/Monark show "HEAD:$f" | tr -d '\r' | sha256sum | cut -d' ' -f1)  $f"
done
```

**(8b) `--prereg-sha`** = sha256 LF du **blob committé du prereg lui-même** (le BROUILLON ne peut pas s'auto-hacher ; la valeur naît au commit) :
```
git -C F:/Monark show HEAD:docs/PLAN-u4b-prereg.md | tr -d '\r' | sha256sum
```
Cette valeur est passée à la course via `--prereg-sha` ; le script refuse de démarrer si elle ne correspond pas au blob committé (garde `lfSha256`).

**(8c) Invariants à réasserter inchangés au commit** (blobs HEAD / pins de test) :
- `book_digest` = `034fbff9eb2ef08079ed478960fcfa86e0e4db6d1c3946156e9170358976b921` (`apps/sentinel/test/ukemi.test.ts:29`, recorder PIN) ;
- `PINNED_DIGEST` (U4 e2 calib_digest) = `267cd9918abde0ee6de23f71c1dc0852d545e00824107c3dfb51f84bb943ea4b` (`apps/sentinel/test/ukemi-u4-scores.test.ts:20`) ;
- digests de cellule U-4b : A `dc9ab572…`, B `89897a61…` (CHECKPOINT2 M-4) ;
- fixtures `u4/` byte-identiques (`743e9499…/97035715…/8b84e095…`) et `u4b/` sha-pinnées ;
- ordre des fournisseurs épinglé (`rpc2.ts:268-269`), `book_digest` inchangé.
- (Le prereg est committé SEUL, exclu R-25 ; aucun code dans le commit du prereg.)

---

## QUESTIONS pour l'orchestrateur (choix/écarts NON couverts par les sources — le worker ne tranche pas)

- **Q1 — Périmètre du prereg.** La mission énumère 8 items ; G0 §7 [C-12] exige que le blob committé porte AUSSI §DISC (P-EPI), les définitions, H-0..H-7 chiffrées et la sonde go/no-go, faute de quoi le prereg ne fige pas la règle de sélection de l'épisode (son objet anti-sélection). Ce brouillon les a **inclus verbatim** des sources adoptées (G0 §2/§4/§6). **À confirmer** : est-ce le périmètre voulu du commit ?
- **Q2 — rpc.ts, valeur de gel.** `apps/sentinel/src/rpc.ts` = `0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0` (aucune référence ADR — ajout par addendum GARDE-HELIUS-2 C-3 / kit de passation §9.5, que je n'ai pas localisé dans le dépôt en lecture seule). **Confirmer** cette valeur comme valeur à figer.
- **Q3 — Amendement ADR-U4b C-7 non atterri.** L'ADR-U4b au HEAD `430e99d` **ne mentionne ni rpc.ts en D4 ni « U-4b-0 subsumé » en D5** (l'addendum GARDE-HELIUS-2 C-7 promettait ces deux amendements). L'amendement ADR **précède-t-il ou accompagne-t-il** le commit du prereg ? (Précondition 2 du §7.)
- **Q4 — Bascule CA (a)→(b).** `percentDivCeil`/dette-ceil désormais **[lu]** ⇒ 1 des 3 conditions de bascule vers (b) « chemin natif complet » remplie ; les 2 autres (préférence investisseur bit-fidélité ; Y re-dérivé même convention) ne le sont pas. **Défaut sourcé = (a).** Décision de valeur : conserver (a) ou déclencher le lot (b) ? (Le worker ne tranche pas.)
- **Q5 — Clôture de l'item « agrégat ≠ Σ jambes ».** Expliqué par [lu] (ceil par jambe, v3.5.0, changelog tag-pinné) + identité mesurée 16 092/16 092. **Confirmer la clôture** de l'item G7 formé (touche le book U-4a, zone `034fbff9`).
- **Q6 — Ratification des constantes de conception H-n.** `k=2` (H-3), `k_H4=5 %` (H-4), `k_H5=100` (H-5) sont « proposés à ratification » ; ce prereg est leur point de ratification. **Ratifiés tels quels ?**
- **Q7 — Plafond de run en RU + réservation Bell.** G0 §6 exprimait le plafond en appels (« ≤ 300 000 toutes méthodes ET ≤ quota restant − 200 000 réservés Bell »). GARDE-HELIUS-2 a migré la comptabilité en **RU / cap de cycle 16 M RU**. **Fixer** `--max-ru` (run) et **l'unité de la réservation « 200 000 » Bell sous comptabilité RU** au commit — neutre : ADR-GARDE-HELIUS D5 mentionne un « leg ETH budgété » Bell (`collect.ts:638`) ⇒ **ne pas présumer** que Bell n'utilise pas Chainstack.
- **Q8 — E-I-3 (une vs deux classes servies).** ADR-U4b la cite comme close par la décision 108 (« classe A seule servie ») ; G0 §12 la listait « ESCALADE INVESTISSEUR EN ATTENTE ». **Confirmer close par 108.**
- **Q9 — Créneaux Narabi.** 00:30/03:30/06:30/09:30 UTC sont une **donnée orchestrateur** (le worker n'a mesuré que « publiant 00:48 » + « 4 créneaux/jour », addendum C-4). **À reconfirmer au journal du sentinel** au moment de la course (les instances A-4 exigent de toute façon le sha du journal). Fenêtres exclues calculées au §4.
- **Q10 — Contrainte d'ordre NARABI-OPS-1d.** Ce lot migre `apps/sentinel/src/rpc.ts` vers le garde. S'il **fusionne entre le commit du prereg et la fin de la course**, `rpc.ts` change ⇒ gel rompu ⇒ **STOP**. À déclarer comme contrainte d'ordre (course terminée AVANT NARABI-OPS-1d, ou re-gel + re-prereg).
- **Q11 — Gel côté Y (anti-sélection).** Le prereg gèle ŷ (u4b-scores + fermeture transitive) mais **PAS Y** : `u3-realized.mjs` (dont `toBase = floorDiv`, `:101-104`, mesuré HEAD) est **modifié en -1b** (paramétrage du labeling, G0 1b-3) ⇒ un code de labels ajustable après avoir vu q̂ peut déplacer les scores `s=|Y−ŷ|`. Le prereg doit-il **épingler la convention de conversion de Y** (sémantique `toBase` floor : test dédié, sha de la fonction extraite, ou gel des lignes) puisque le fichier ne peut pas être gelé entier ? (Le worker ne tranche pas.)

---

### Provenance (règle de branchement)
Entrées lues ce tour (lecture seule) : `docs/adr/ADR-U4b-calibration-episode-frais.md`, `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md`, `docs/G0-lot-u4b.md`, `docs/G2-lot-u4b-1a.md`, `docs/G7-lot-u4b-1a.md`, `docs/CHECKPOINT2-lot-u4b-1a.md`, `docs/G0-ADDENDUM-lot-garde-helius-2.md`, `docs/CHANTIERS.md` (décision 119), `F:\PRODUITS\etude-2026-09-21\ukemi-u4b-prerequis\{PR-U4-3-ter-FAITS-arrondi-CA,PR-U4-3-ter-RAPPORT-lecteur-percentagemath,AVIS-advisor-defi-agregat-et-arrondi-CA}-2026-09-21.md`, blobs HEAD des 7 fichiers gelés + imports. Sortie : ce brouillon (consommé par l'orchestrateur pour vérification adversariale R-21, puis commit éventuel du prereg). État : plan (aucun code, aucun réseau, aucun commit). Modèle épinglé `claude-opus-4-8[1m]`, effort max, 2026-09-21. Réviseur = orchestrateur.
