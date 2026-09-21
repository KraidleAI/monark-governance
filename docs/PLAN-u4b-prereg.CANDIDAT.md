# PLAN-u4b-prereg — Pré-enregistrement U-4b-1b : calibration conforme sur épisode FRAIS (ŷ close factor v3.5.0 au premier franchissement, deux cellules Mondrian, gel du code de score AVANT les données)

> **Cible de commit** (par l'orchestrateur, SEUL — R-20) : `docs/PLAN-u4b-prereg.md`, committé **SEUL** (aucun code, exclu R-25) **avant tout appel réseau**. Le script de course refuse de démarrer sans `--prereg-sha` == sha256 **LF** du blob committé de ce fichier (garde `lfSha256`).
> **Provenance de la rédaction** : worker `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-21. Base LECTURE SEULE : `F:\Monark` `lot/etude-suite` HEAD `b38a3993bef8e30e4371c6c5ebd6e57cda36ef6a` (`git rev-parse HEAD`, ce tour ; ≥ `b38a399`). Aucun réseau, aucun commit, aucun workflow. Mesures reproductibles : `MESURES.md`. Réviseur = orchestrateur (vérification adversariale R-21).
> **Rulings orchestrateur appliqués** (Q1–Q11) : `docs/CHANTIERS.md` puce « prereg U-4b-1b … rulings orchestrateur » (~21:1x UTC) + avis advisor-defi verbatim (`AVIS-advisor-defi-prereg-u4b-1b-2026-09-21.md`) — voir « Provenance des rulings » en fin.
> **Périmètre (ruling Q1)** : 8 sections de fond **+** §DISC (P-EPI), définitions, H-0..H-7 chiffrées, sonde go/no-go — G0 §7 [C-12] (sinon le prereg ne fige pas la règle de sélection de l'épisode).
> **Note de gel D4 (régime B / AM-1)** : les sha du §2 seront **recomputés à l'identique au commit réel** depuis les blobs HEAD (`git show HEAD:… | tr -d '\r' | sha256sum`), jamais depuis `git status`. Toute divergence au commit = ÉCART = STOP.

---

## (1) Objet et régime (D4)

**Objet.** Figer AVANT tout appel : (i) la règle mécanique de découverte de l'épisode FRAIS (P-EPI, §DISC) ; (ii) toutes les définitions et choix de méthode à effet mesuré (liste fermée C-V-7, §3) ; (iii) la **convention d'étiquetage Y et son gel déféré** (ruling Q11, §Y) ; (iv) H-0..H-7 avec critères de NON ; (v) le protocole de budget/rapprochement Chainstack sous garde (A-4 + décision 121, §4-§Sonde) ; (vi) le **GEL par sha du code de score et de sa fermeture transitive** (§2). Objectif anti « sélection sur l'issue » : le code qui produira les scores frais (ŷ) ET la convention qui produira Y sont figés AVANT que la donnée fraîche existe ; ni le score-code ni le labeler ne peuvent être ajustés après avoir vu un q̂ flatteur.

**Régime (D4, régime B, ADR-C01 amendement cadence 2026-09-21).** Prereg committé SEUL ; `--prereg-sha` obligatoire ; preuve d'intégrité = **blobs HEAD** (AM-1). U-4b-0 (« consommer `@monark/rpc-guard` ») est **SUBSUMÉ par GARDE-HELIUS-2** (ADR-U4b D5, clause en ligne `798b4e9` ; addendum D4 (iii)) : le discover/calib consomme le recorder GARDÉ, aucun second compteur de budget. L'amendement ADR-U4b daté 2026-09-21 (C-7, commit `2d1d685`) est **EN LIGNE** : `rpc.ts` au gel D4, U-4b-0 subsumé en D5, contrainte d'ordre NARABI-OPS-1d, note « plafond par compte » (décision 121).

**Préconditions dures du commit** (récap §7, chacune un item formé à déclencheur) : GARDE-HELIUS-2b-ii fusionné (arguments recorder finaux — **non fusionné à cette lecture**, `docs/G0-lot-garde-helius-2b-ii.md`, checkpoint-1 en vol ⇒ arguments recorder « confirmés au commit ») ; C-15 (Mondrian 2003 [lu]) satisfaite ; `PR-U4-3-bis` si l'impl de l'épisode découvert ≠ v3.5.0 (H-1).

---

## §DISC — Règle de sélection de l'épisode FRAIS, PRÉ-ENREGISTRÉE (G0 §2, [C-5]/[C-6])

Contrainte de fond (mesurée, `u3-realized.mjs:3-5,:40`) : le census A n'a observé que trois clusters (e1 sUSDe, **e2 WETH = CONCEPTION**, e3 sUSDe) ; seul e2 est WETH-collatéral. U-4b **découvre** un nouveau cluster WETH (~280 k appels, décision 91). Règle fixée avant tout appel :

```
# Entrées : B_lo, B_hi_rule, e2_window=[23545088,23557060], N_min (=50, ruling E-I-2)
B_lo        = 22803459                      # bascule feed WETH → proxy SVR 0x5424384b… (PR-U4-1:41,45) : sémantique D_e == e2
B_hi        = finalized - 64                # RÈGLE : finalized lu à l'exécution, horodaté dans le brut de découverte
logs        = getLogs(Pool, [LIQ_TOPIC], B_lo, B_hi)      quorum-2   # LIQ_TOPIC = u3-realized.mjs:54 — COMPTÉ AU BUDGET [C-19]
logs        = { L in logs : block(L) not in e2_window }            # e2 exclu : conception, jamais servi

# clustering VERBATIM la règle U-3 D2 (ADR-U3:30-31) :
for each L in logs ordered by (block, logIndex):
    if collateralAsset(L) != WETH: continue
    if L not yet assigned to a cluster:
        B_first = block(L)
        B_last  = firstBlockAtOrAfter( ts(B_first) + 86400 ) - 1     # windows.ts ; bloc jamais horodaté
        cluster = { M in logs : collateralAsset(M)==WETH and B_first <= block(M) <= B_last }
        residual_outside_window += { M : block(M) not in [B_first,B_last] }   # nommé, compté

eligible(cluster) :=
      collateralAsset == WETH
  AND B_last <= B_hi                                                          # fenêtre 24h COMPLÈTE ; sinon window_truncated compté [C-5]
  AND count(distinct liquidated accounts in cluster) >= N_min                 # N_min = 50 (E-I-2)
  AND version_ok(impl(Pool @ B_first))
candidats = { cluster : eligible(cluster) }

episode = argmin over candidats of B_first          # (i) PREMIER éligible chronologiquement (E-I-1 ; moindre sélection-sur-la-taille)
# tie-break secondaire (B_first égal) : plus grand count(distinct liquidated), puis address min
episode_id = "weth-" + date(B_first)
B_first, B_last, B0 = B_first - 1                    # écrits dans episode-selection.json, DÉRIVÉS des bruts

version_ok(impl) :=  (impl == v3.5.0  0x97287a4f…)  OR  (impl_diff_LiquidationLogic_sol_lu_et_declare_NEUTRE(impl))
```
`episode-selection.json` reproductible depuis `(prereg_sha, brut de découverte)` (`u4b_episode_selection_is_deterministic`). Les 5 constantes close factor sont identiques v3.3.0→v3.7.0 (`PR-U4-3:159-160`) ; le risque porte sur la logique ⇒ **`PR-U4-3-bis` (lire l'impl effective au niveau [lu], déclarer le diff NEUTRE) est une PRÉCONDITION** de tout ŷ sur un épisode v3.6.0 (H-1). Toute relaxation post-H-0-NON (fenêtre, N_min) = **D-n déclarée au PLI**.

---

## Définitions pré-enregistrées (ADR-U4b D1/D2/D3)

- **Unité** = compte **mono-collatéral WETH** à B₀ : `collat_non_WETH_base(p0)/total_collateral_base(p0) ≤ X`, **X = 0** (lecture stricte, décision 91). e-mode hors {0,1} ⇒ fail-closed. LST = catégorie e-mode 1 ∧ ≠ WETH (rsETH hors) ; dette LST tenue à p0 (`lst_debt_at_p0`). Ancre pré-B₀ = `AnswerUpdated ≤ B₀` réel.
- **ŷ** (ADR-U4b D2, règle v3.5.0 [lu] `PR-U4-3`, tag `6138e1fda…`) = **maximum liquidable en UN appel au PREMIER FRANCHISSEMENT p\*** : `ŷ = max_r min(CF(HF), C_r/m_r)` (multi-dettes = **max**, jamais Σ), `CF_base = min(D_r, 0,5·D_tot)` si `C_r ≥ 2000e8 ET D_r ≥ 2000e8 ET HF(p*) > 0,95e18` (strict) sinon `D_r` ; `CA = floor(C·1e4/bonus)` ; `MustNotLeaveDust` en **OU** ; `m` (bonus) lu de la **réserve** / de `emode_raw` (C-14), **non figé par le prereg** — valeurs mesurées sur e2 : 10 100 (e-mode) / 10 500. Convention **`D_tot(p*) = total_debt_base − vWETH@p0 + vWETH@p*`** (agrégat on-chain autoritaire, ADR-U1 C-2). Score/ŷ en **devise de base 8-dec**, convention floor partagée avec `toBase` de Y.
- **Score, α, nMin, Mondrian** (ADR-U4b D3) : `s = |Y − ŷ|`, sans clipage, tri canonique ; `q̂` = p-ᵉ plus petit, `p = ⌈(n+1)(1−α)⌉`, **α = 0,01**, **nMin = 100** par strate (Dunn 2022 Thm 11 strict) ; strates de la classe A par taille de ŷ aux frontières **du code** : `< 2000e8`, `[2000e8, 100 k$)`, `[100 k$, 1 M$)`, `≥ 1 M$`. En **couverture**, jamais en probabilité. Précondition C-15 (Mondrian 2003 [lu], κ fixée A PRIORI) satisfaite.
- **Classes** : **A** `liquidation-eligible-coverage` = {ŷ > 0 sous D_e} ∪ {liquidés} — **la seule SERVIE** (décision 108) ; **B** `liquidation-realized-given-liquidated` = liquidés — **calculée hors ligne, JAMAIS servie**. Le code gelé émet les DEUX cellules sur toute donnée ; -2 décide seul ce qui est servi. **E-I-3 close par la décision 108** (ruling Q8).

---

## §Y — Convention d'étiquetage Y, gel DÉFÉRÉ et règle d'abstention (ruling Q11 : option (ii) + gel déféré)

**Convention de Y = ADR-U3 D1/D2 (adoptée le 2026-09-20, ANTÉRIEURE à toute donnée -1b), VERBATIM `docs/adr/ADR-U3-realized-labels.md:22-33`** :
> **D1 — Étiquettes réelles.** Y_{i,e} est **mesurée on-chain**, par position `(user, debtAsset, collateralAsset)`, agrégée sur la fenêtre 24 h, décomposée : `repayment_base = Σ floor(debtToCover × getAssetPrice(debt)@bloc / 10^dec)` ; `seized_base = Σ floor(liquidatedCollateralAmount × getAssetPrice(coll)@bloc / 10^dec)` (frais protocole exclu) ; `deficit_base` = Σ `DeficitCreated(user, debtAsset, amount)` de la fenêtre joints par `(user, debtAsset)` (toute tx ; D-5). Montants base en `BASE_CURRENCY_UNIT()` (8 déc., **lu on-chain**, jamais codé). Sommes natives conservées. **Prix au bloc du log**, jamais un prix moyen (résidu `price_moved_in_block` si l'oracle a bougé dans le bloc).
> **D2 — Fenêtre ancrée bloc, jamais horodatée.** `B_first` = premier `LiquidationCall` du cluster (A-rawlogs, déterministe) ; `B_last = firstBlockAtOrAfter(ts(B_first)+86400) − 1` (`apps/sentinel/src/windows.ts`, ts de bloc en quorum-2). Lignes de bloc > B_last comptées en résidu `outside_window` (e2 : 29). Le cluster e2 = collatéral WETH, bloc ∈ [23545088, 23557060] (M-2b, sha-pinné). *(clause e2 = jeu de conception ; l'épisode frais applique la même RÈGLE avec ses propres `B_first`/`B_last`.)*

**Règle d'agrégation servie** : `Y = Σ_user (repayment_base + deficit_base)` + complétion USDT — **déjà GELÉE** dans `u4b-scores.mjs:102-120` (sha `9ad20666…`). `toBase` de Y = **floorDiv** (mesuré blob HEAD, `u3-realized.mjs:101-104` : `floorDiv(BigInt(amount)·BigInt(price), 10n**BigInt(dec))`).

**Gel DÉFÉRÉ à la sonde (le fichier ne peut être gelé entier : il est modifié en -1b)** :
- **`--labeler-sha` obligatoire** (motif `--prereg-sha`) = sha256 **LF** du blob HEAD de `scripts/census/u3-realized.mjs`, **= `755b3a38f0253edb464624f8cdaa52385d4f9e2f1227a7bd303653b618db2de4` aujourd'hui** (mesuré, §2). Écrit dans la **sonde go/no-go ET le brut de découverte AVANT le premier appel** ; G2 rejoue avec ce blob ; changement postérieur = **D-n**, labels re-dérivés = post-hoc non servables.
- **Invariant behavioural** : `u3_series_replay_bit_identical` vert avec `U3-realized.jsonl` sha **`b4d93590f07b21017abe8ec2d980dee1f258a968395eb32497e6f9543b6f3923`** (pin `PROVENANCE-u3.md:10`, explicitement épinglé ici — ferme la co-édition fixture/PROVENANCE). Test `u4b_labels_replay` = le labeler paramétré reproduit e2 byte-identique depuis `U3-inputs.jsonl`.
- **Paramétrage -1b CONFINÉ à la section LIVE** de `u3-realized.mjs` (l.269+ : `EVENTS`, `RAWLOGS_SHA`, chemin prereg deviennent des paramètres) ; le **réducteur PUR** (`canon`/`toBase`/`reduceU3`, l.81-267) ne change pas. **Condition de bascule (i-a)** : si -1b devait toucher le réducteur pur, l'extraction du réducteur en fichier séparé + **8ᵉ sha au gel D4** devient OBLIGATOIRE avant le prereg (le gel déféré ne protège que ce qui n'a pas besoin de changer).

**Règle d'abstention PRÉ-ENREGISTRÉE (VERBATIM avis advisor-defi §Q11 l.44, le point clé anti-« rustine labeler »)** :
> « ligne de label abstenue (`no_quorum`, `repayment_base: null`) ou `deficit_base_no_price` sur un actif ≠ USDT ⇒ **re-tirage sous budget jusqu'au quorum** ; sinon **STOP + D-n** ; **jamais d'exclusion silencieuse d'un compte liquidé de la cellule A** ; le code gelé jette, et c'est voulu. »
Les deux chemins fail-closed qui jettent (avis §Q11 l.23 ; **mesurés blob HEAD ce tour**) : `u3-realized.mjs:225` (`repayment_base: abstain ? null : repayBase.toString()`) et `u4b-scores.mjs:112` (`throw … deficit_base_no_price on non-USDT asset … (fail-closed)`). Compteur `labels_no_quorum` au census. **Portée** : la convention de Y est fixe pour la **vie de la calibration servie** (la région servie est jugée contre un Y futur étiqueté par la même convention), pas seulement jusqu'à la course (Barber-Candès-Ramdas-Tibshirani 2023 **[lu par advisor-defi sur texte local `_txt/`, avis §Q11 l.26]** : la fonction raw→Y fait partie de la fonction de non-conformité S, qui doit être pré-fixée et indépendante du jeu de calibration).

---

## H-0..H-7 — hypothèses avec critère de NON (rulings Q6 appliqués)

- **H-0 (existence)** : ≥ 1 cluster WETH éligible dans `[B_lo,B_hi] \ e2`. NON ⇒ arrêt `no_fresh_episode`, item formé (élargir fenêtre / abaisser N_min = décision investisseur), AUCUNE course.
- **H-1 (version)** : impl @B_first `== v3.5.0` OU diff [lu]-neutre. NON (diff non lu) ⇒ course EN PAUSE, `PR-U4-3-bis`.
- **H-2 (n/strate)** : n(strate) ≥ nMin ; NON ⇒ strate `under_calib` (comptée).
- **H-3 (échangeabilité INTER-épisodes) — TEST EXACT BÊTA-BINOMIAL 5 % (ruling Q6, remplace `k=2`)** : appliquer le q̂ FRAIS à la cellule e2 ; sous H0 d'échangeabilité (scores continus i.i.d.), le nombre de scores e2 `≤ q̂_frais` suit **exactement** une loi bêta-binomiale `(n_e2, p, n+1−p)`. **Critère de NON** = **test exact bêta-binomial unilatéral à niveau pré-enregistré 5 %**, appliqué **par strate SERVIE** (q̂ par strate) **ET sur la cellule A poolée** ; couverture définie `s ≤ q̂` (fermée, cohérente avec la région). NON sur une strate servie ⇒ **écart en chiffres** (Σ w̃·d_TV, Barber 2023 Thm 2) pour cette strate ; **aucune revendication sur un nouvel événement**. **`k=2` REJETÉ** : ce n'est pas un niveau (taux de faux-NON sous H0 mesuré = 3,6 % à n=150, 5,8 % à n=565, 6,3 % à n=300, 10,4 % à n=1000 ; dépend de n). **Strate e2 de comparaison < 50** (strates 2 : 46, 3 : 8) ⇒ **H-3 non testable, rapporté**. **Texte servi (C-11)** : « un OUI de H-3 ne licencie rien de plus » ; mutant de sur-revendication ⇒ ROUGE.
- **H-4 (multi-appels) — 5 % ratifié AVEC le chiffre e2 (ruling Q6)** : e2 = **11,1 % de la cellule A** (11/99 liquidés mono-WETH) / **12,7 % tous liquidés** (24/189) ont > 1 `LiquidationCall` ⇒ **NON attendu** sur l'épisode frais (déclaration de sous-prédiction acquise d'avance ; 5 % ne teste rien). Grandeur informative rapportée : **part de Y provenant des appels APRÈS le premier**, par strate (médiane et Σ).
- **H-5 (population) — DÉRIVÉ de nMin (ruling Q6)** : `k_H5 = nMin = 100` (Dunn 2022 Thm 11 strict, `n > 1/α − 1 = 99`). Population e2 mono-WETH ≈ 9 452 ⇒ facteur ~100. Condition **nécessaire, non suffisante** de H-2 (population ≥ 100 n'implique pas cellule A ≥ 100 par strate). Rapporté.
- **H-6 (série SERVIE)** : valeur d'oracle servie ∈ série `AnswerUpdated` + borne de retard 1–3 events ; NON ⇒ p_min re-défendu par encadrement.
- **H-7 (identité)** : à p\*=p0, `HF == hf0` EXACT ; mutant LT_W←0 ROUGE.

**Cadre (ruling Q6, à écrire tel quel)** : H-3, H-4, H-5 sont des **seuils de RAPPORT**, pas des paramètres de validité. **Rien de servi ne dépend de ces trois constantes** (H-3 OUI « ne licencie rien de plus », NON = rapport chiffré ; H-4 NON = déclaration ; H-5 = rapporté). Établis (paramètres de validité) : `α=0,01`, `nMin=100`, coupes `{2000e8, 100k$, 1M$}`, `X=0` (C-V-7), `N_min=50` (E-I-2), tie-break (i) (E-I-1).

---

## (2) Tableau des 8 sha GELÉS — recompute depuis les blobs HEAD, comparaison à l'ADR

Méthode (régime B) : `git -C F:/Monark show HEAD:<path> | tr -d '\r' | sha256sum` — HEAD `b38a399`. Recomputé au commit réel (D4) ; **ÉCART = STOP**.

| # | Fichier | sha256 LF recomputé (HEAD `b38a399`) | Référence ADR | Verdict |
|---|---|---|---|---|
| 1 | `scripts/census/u4b/u4b-scores.mjs` | `9ad20666af878c630073d998c6d3bc0bca38017e73b406853bcc31c3f83feacf` | ADR-U4b D4 (complet) | **CONCORDANCE** |
| 2 | `scripts/census/u4b/u4b-reduce.mjs` | `a5e66cd387279f4696f09853633a553840dadc53979f78b94aa6f9af57a6fac0` | ADR-U4b D4 (complet) | **CONCORDANCE** |
| 3 | `scripts/record-u4b-calib.mjs` | `5733daeb7c8ee40ab0a657882bbe1a9bd03a00d4ddab99e01cfa052a1fbc31a3` | ADR-U4b D4 (complet) | **CONCORDANCE** |
| 4 | `apps/sentinel/src/ukemi/wadray.ts` | `7bee76fc96a9bc23bb5869ba89167ef58c0f1e8481ed0467ed445c0ee4de2322` | ADR-U4b D4/C-V-2 (`7bee76fc…`) | **CONCORDANCE (préfixe)** |
| 5 | `apps/sentinel/src/ukemi/abi.ts` | `3376eb084f522cb25d708369efb9bc9d11f7b4598abdf4f36708bfd2c1ab2d66` | ADR-U4b D4/C-V-2 (`3376eb08…`) | **CONCORDANCE (préfixe)** |
| 6 | `packages/hikae/src/l1-split.ts` | `9206df9189d3eba6af61ba3f4a0981b08d80b63f99d171ad3e5a01958164ffa3` | ADR-U4b D4/C-V-2 (`9206df91…`) | **CONCORDANCE (préfixe)** |
| 7 | `apps/sentinel/src/rpc.ts` | `0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0` | **ADR-U4b amendement §1 (complet)** `0e232519…` | **CONCORDANCE** (ruling Q2) |
| 8 | `scripts/census/u3-realized.mjs` (**labeler**) | `755b3a38f0253edb464624f8cdaa52385d4f9e2f1227a7bd303653b618db2de4` | `--labeler-sha` attendu (ruling Q11) `755b3a38…` | **CONCORDANCE** |

**Bilan : les 8 sha concordent (7 gelés + labeler). AUCUN ÉCART. PAS DE STOP.**

**Fermeture transitive (mesurée, `MESURES.md`)** : sur `apps/**/src` + `packages/**/src`, hors builtins `node:*` et `@monark/contracts` (= `calib-digest.ts`, `contracts_frozen`), le jeu gelé {u4b-scores, u4b-reduce, record-u4b-calib, wadray, abi→rpc, rpc, l1-split} est **fermé** : `abi.ts:7` importe `TRANSFER_TOPIC` de `../rpc.ts` (constante littérale `rpc.ts:15`) ; `wadray.ts`, `l1-split.ts`, `rpc.ts` sont des feuilles (`rpc.ts` n'importe que `node:crypto`). Le **labeler** `u3-realized.mjs` est gelé par sonde (`--labeler-sha`), non par sha in-repo (modifié en -1b, section live).

---

## (3) Liste fermée C-V-7 (verbatim) + formulation CA (a) (ruling Q4) + agrégat ≠ Σ jambes CLOS (ruling Q5)

**C-V-7 — liste fermée, effet mesuré (VERBATIM `CHECKPOINT2-lot-u4b-1a.md` §C-V-7)** :
> « X=0 exact (6 611 exclus, dont 483 sub-$1, C-V-4) ; e-mode fail-closed hors {0,1} (33) ; LST = emcat 1 ∧ ≠ WETH, rsETH hors, dette LST tenue à p0 (105 comptes, Σ|Δŷ| ≈ $695) ; tie-break dust = premier dans l'ordre des balances (`dust_bounded` seul) ; scale 1 ; score en devise de base vs floor natif (C-G2-3 a) ; `CA` en division floor (C-G2-3 b, `PR-U4-3-ter` formé) ; **convention D_tot (C-V-1)** ; `>` strict sur 0,95e18 asserté par lecture, non discriminable sur e2 (0 compte à l'égalité). »

**Précision C-V-4** : « 483 résidus sub-$1 = rounding » est **faux** ; 478/483 sont de vrais collatéraux non-WETH minuscules (histogramme : 5 ≤ 5 u., 16 dans 6–100, 135 dans 101–1e4, 199 dans 1e4–1e6, 128 dans 1e6–1e8). X=0 (lecture stricte) confirmé.

**Convention D_tot (C-V-1) — deux mesures d'effet** : Σ jambes floor vs code ⇒ 140/565 ŷ (±1–2 u.), 1 p\* (`0x01a7bb45…`), digest (mutant ROUGE) ; variante « Σ ceil, WETH repricé » vs code ⇒ **0/565 ŷ, 0 p\*, q̂ identiques** ([mesuré] advisor-defi). La convention D2 gelée équivaut à la convention de principe sur e2.

**Formulation de l'écart CA à pré-enregistrer (ruling Q4 = (a) ; VERBATIM avis advisor-defi prereg §Q4)** :
> « ŷ est calculé en devise de base (8 déc.) avec la convention floor de `toBase` (ADR-U3 D1). Il n'est PAS le chemin natif du contrat v3.5.0 (floor natif → `percentDivCeil` → floor `toBase` ; lu [lu] PR-U4-3-ter). Écart **déclaré** (non prouvé formellement, vérifié sur e2) : |ŷ_base − toBase(ŷ_natif)| ≤ 1 quantum natif de l'actif de dette converti en base (`prix_dette / 10^dec_dette`, unités 8-déc) + 2 unités (percentMul demi-arrondi ±1, conversion floor ±1), sur toutes les branches (CA et close factor). Mesuré sur e2 (conception) : 3/565 comptes `ca_binding`, tous strate 0, Δ ∈ {−85 632, −106 302, +3 683} unités ; Δq̂ = 0 sur toutes strates, 0 strate changée, 0 p\* changé. Sur l'épisode frais, l'écart est **re-mesuré hors ligne après la course** (recette R2 de l'avis advisor-defi 2026-09-21, hors gel), **rapporté, sans effet sur les scores servis** ; Δq̂ ≠ 0 sur une strate servie ⇒ D-n déclarée au PLI, la calibration servie reste celle du code gelé. Libellé : "maximum liquidable en un appel, en devise de base, à un quantum natif près". »

**(b) « chemin natif complet »** = item formé **« calibration suivante », NON RÉTROACTIF à l'épisode -1b** (ruling Q4). Il n'existe pas de « (b) plus tard pour -1b » : (b) exige un re-gel de `u4b-scores` avant le prereg, sinon rescorer post-course est post-hoc. Gain mesuré de (b) : Δq̂ = 0.

**« agrégat ≠ Σ jambes » — item G7 formé : CLOS (ruling Q5)**. Expliqué par [mesuré + lu] : `total_debt_base == Σ_jambes ceil(montant·prix/unité)` pour 16 092/16 092 comptes (advisor-defi) ; `GenericLogic._getUserDebtInBaseCurrency = MathUtils.mulDivCeil` ⇒ dette au PLAFOND en base, changelog v3.5.0 tag-pinné « rounded up » pour la dette, « always round in favor of the protocol » (RAPPORT-lecteur PR-U4-3-ter Q5 [lu, WebFetch ; `MathUtils.mulDivCeil` elle-même NON LUE — preuve dure = identité 16 092/16 092]).

---

## (4) Protocole agrégat Chainstack A-4 (ADR-GARDE-HELIUS A-4) + décision 121 PAR COMPTE + créneaux exclus

**Mode et nœud** : `runReconcile(mode="aggregate-calibration")` ; **1ʳᵉ course Chainstack = ÉTALONNAGE** ; **nœud Global CONFIRMÉ** (console Statistics, A-1). Borne dure BLOQUE (exit 1 si `Δtotal_ru > Σ ledger_run`) ; écart souple **CONSIGNÉ** (`softDeviation`, exit 0) ⇒ pré-enregistre la bande de la 2ᵉ course.

**Décision 121 — plafond Chainstack PAR COMPTE (portée orchestrateur, CHANTIERS:603 ; verbatim investisseur : « A »)** : le cap 16 M RU (décision 115) est **par COMPTE, tous réseaux confondus** (`ethereum-mainnet` Ukemi + `solana-mainnet` Bell + autre). Conséquences portées ici : **un seul ledger** de cycle Chainstack, **une seule clé de cycle**, **floor = somme des réseaux** lu au tableau de bord ; le rapprochement **A-4 lit le total du compte ET la ligne `ethereum-mainnet`** (le job Narabi et une éventuelle sonde Bell comptent dans le même plafond) ; la ventilation par réseau est un **attribut du journal (`network`), jamais un second plafond**.

**Protocole A-4 (couche règles ; INSTANCES épinglées par sha au prereg)** :
- **(i)** fenêtre d'une **JOURNÉE entière** ;
- **(ii)** **double lecture de stabilité** de `after` APRÈS le délai de mise à jour (« Data updates every few hours », FAITS pt 10) — deux lectures identiques espacées ; **espacement = INSTANCE à remplir à la course** ;
- **(iii)** **aucune fenêtre before/after de rapprochement ne chevauche l'heure d'un créneau du job Narabi** (addendum C-4 verbatim) ;
- **(iv)** le résiduel Narabi soustrait = **MINORANT** (borne inférieure), lu au **journal du sentinel** (nombre d'appels Chainstack du jour, réseau `ethereum-mainnet`) — un résiduel surestimé cacherait un contournement.

**Instances portées par le prereg** : jour ; heures des deux lectures (ii) ; floor (`--floor`, lu au dashboard = somme des réseaux, décision 121) ; chiffre du résiduel Narabi ; **sha du journal du sentinel**. `AGGREGATE_ONLY_OPERATORS = {chainstack}` ⇒ `--mode aggregate|aggregate-calibration` fail-closed avant tout verrou.

**Créneaux exclus — CALCULÉS depuis les créneaux fournis** (donnée orchestrateur : Narabi 00:30 / 03:30 / 06:30 / 09:30 UTC, durée + 30 min ; **à RECONFIRMER au journal du sentinel à la course**, ruling Q9 — le worker n'a mesuré que « publiant 00:48 UTC » + « 4 créneaux/jour », addendum C-4). Fenêtres d'exclusion des **instants de lecture** before/after (UTC) : **00:30–01:00, 03:30–04:00, 06:30–07:00, 09:30–10:00**. Les deux lectures (ii) se placent hors de ces 4 fenêtres, après le délai de mise à jour. (00:48 mesuré ∈ [00:30–01:00], cohérent.)

**Corollaires** : overage DÉSACTIVÉ (A-5) ⇒ à quota atteint Chainstack ARRÊTE le service (dont Narabi), pas de facture ; le cap protège la disponibilité. Quota mensuel exact / prix d'overage : NON LU (procurement si une course approche 16 M RU).

---

## Sonde AVANT la course (go/no-go, G0 §6 + ruling Q11)

- **(a)** énumération `Transfer` aWETH ≈ **1 412 getLogs/opérateur** ;
- **(b)** appels projetés `≈ N × (1 + k_coll + 2 + k_debt) × 2` ;
- **(c)** sonde getLogs large **Pocket L-5** (précondition POOL-RPC-1a L-3 branche B) ;
- **(d)** **1 `eth_call` `s_cutoffTime()` @B_fresh sous garde** (E-I-7 = OUI) ;
- **(e)** **distinct-par-groupe `{nodies, pocket} = 1` ≥ 2/méthode** [C-3] — **vérifié AVEC `--exclude-operators mevblocker` appliqué** : ETH_CALL = {drpc, {nodies, pocket}} = **exactement 2 groupes, marge nulle** (`u4-oracle-path.mjs:56-57,127` exclut déjà `mevblocker.io`, D-5) ; **part Chainstack projetée**, **plafond** (par compte, décision 121), **règle d'arrêt** (dépassement projeté ⇒ arrêt + consultation) ;
- **(f) Gel temporel (ruling Q11)** : `--prereg-sha` (blob du prereg) **ET `--labeler-sha`** (blob HEAD de `u3-realized.mjs`, `755b3a38…`) **ET HEAD** écrits dans la sonde et le brut de découverte **AVANT le premier appel** ;
- **(g) Compteurs d'abstention (ruling Q11)** : `labels_no_quorum` compté ; règle d'abstention = re-tirage sous budget jusqu'au quorum, sinon STOP + D-n, jamais d'exclusion silencieuse.
- **Discipline secret** : `archive-env`, jamais URL/clé ; **CGU lues avant tout appel d'API de données** (règle 2026-09-20).
- **Budget** : découverte comptée au budget [C-19]. Projection d'ordre : ~280 k appels (décision 91) × 2 RU/appel (recorder = méthodes 2 RU, A-1) ≈ **~560 k RU** (projection à raffiner par la sonde, ≪ cap par compte 16 M RU).

---

## (5) Arguments de course (recorder « confirmés au commit » ; `reconcile` ; `--concordance-out`)

**Deux surfaces CLI distinctes.**

**(5a) Recorder de la course** (`runRecorder`, GARDE-HELIUS-2 D4 ; **GARDE-HELIUS-2b-ii NON fusionné à cette lecture** ⇒ noms **CONFIRMÉS AU COMMIT** contre la signature fusionnée ; **2b-iii** portera les scripts `u4-*` payants avant la course, CHANTIERS:605) :
- `--ledger-dir <hors dépôt>` (`F:\monark-ledger\<cycle>\`) ; `--cycle <id>` (**un seul par compte**, décision 121) ; `--floor <RU>` (= somme des réseaux, lu au dashboard) ; `--max-ru <RU>` ; `--method-caps <table>` (fail-closed) ; `--max-calls <n>` ; `--exclude-operators mevblocker` (D-5) ; `--concordance-out <hors dépôt>` (couture POOL-RPC-1a C-5/C-6 ; déclencheur du producteur de concordance, décision 100 ; note orchestrateur G0-lot-u4b `:362`) ; `--prereg-sha` (garde `lfSha256`) ; **`--labeler-sha` = `755b3a38…`** (ruling Q11).

**(5b) `reconcile` servi** (`runCli reconcile`) : `--before`, `--after`, `--cycle`, **`--mode aggregate-calibration`** (`--mode` est un argument de `reconcile`, PAS du recorder).

**Ordre des fournisseurs ÉPINGLÉ** (`rpc2.ts:268-269`) : `ETH_CALL_PROVIDERS` = [drpc, mevblocker, nodies, pocket] ; `GET_LOGS_PROVIDERS` = [drpc, mevblocker, tenderly, pocket]. Les scripts de course importent cet ordre de `rpc2.ts` (source UNIQUE : `u4-oracle-path.mjs:21`, `u4-probe.mjs:29`). **Après GARDE-HELIUS-2b** ces URL deviennent des labels résolus, ordre identique, `book_digest` inchangé, `CHAINSTACK_ETH_URL` lu dans `transport.ts` seul ; **au HEAD mesuré `record.ts:17,328-330` importe encore les URL de `rpc2.ts` et lit `CHAINSTACK_ETH_URL`** (addendum C-3 fait 1 — état confirmé au commit post-2b).

---

## (6) Critères GO / STOP

**Séquence de fin de course** :
1. **`unlock` (N)** — relâcher **CHAQUE opérateur demandé** (A-2 : tous verrouillés, payants ET keyless ; 2b relâche tous les demandés) : `chainstack` + les 5 labels keyless ETH (drpc, mevblocker, nodies, pocket, tenderly), **une ligne `unlocked` chaînée chacun**. (Un `reconcile` sous verrou tenu ⇒ `LockHeldError`, C-V-4 ⇒ `unlock` D'ABORD.)
2. **`reconcile --mode aggregate-calibration`** — **GO ssi `Δdashboard ≤ ledger_run`** (borne DURE ; `Δtotal_ru ≤ Σ ledger_run` en RU conservateurs). Bande souple `≤ max(50 RU, 0,5 % du run total)` (décision 113 / addendum C-1) : **CONSIGNÉE, non bloquante** en `aggregate-calibration`. `Δ > ledger_run` ⇒ **NO-GO dur** ; `Δ` négatif ⇒ **NO-GO `negative_delta`** ; rollover ⇒ NO-GO. **Le rapprochement lit le total du compte ET la ligne `ethereum-mainnet`** (décision 121).

**Plafonds anti-BUG fail-closed (décision 119, non levés par le GO durable ; décision 121 : PAR COMPTE)** : **Chainstack 16 M RU / cycle, PAR COMPTE** (décisions 115 + 121) ; `--max-ru` (run, fixé au commit depuis le floor lu sur place — ruling Q7) et `--method-caps`. **Plafond touché ⇒ STOP + retour investisseur** (« peu importe le coût » n'autorise pas une dépense par défaut logiciel — leçon HELIUS-1). Helius 8 M cr cité par 119 mais **inapplicable** (une course Ukemi ne verrouille jamais `helius`, A-2). Aucun gate suspendu (R-22) ; aucune règle de sécurité levée.

**GO durable amont (décision 119)** : la course U-4b-1b a le GO dès GARDE-HELIUS-2 fusionné, prereg committé seul, rapprochement before/after — sans nouveau go.

---

## (7) Ce que le prereg NE décide PAS + préconditions du commit

- **Hors décision 119** : contre-vérification **Bell** (~5,4 M cr) et C-F-4 ; **live U-6** ; mise en ligne du site (décision 101) ; DNS Bell ; tout achat/action de compte. **Q7** : la **réservation Bell est exprimée en RU au TEMPS 2 seulement** (Bell hors temps 1) ; à fixer alors, unité RU, dans le même plafond par compte (décision 121). Ne pas présumer que Bell n'utilise pas Chainstack (ADR-GARDE-HELIUS D5 : « leg ETH budgété » Bell, `collect.ts:638`).
- **Le q̂ et les intervalles** : produits par la course, jamais pré-décidés.
- **L'épisode frais** : découvert mécaniquement (P-EPI) ; le prereg fige la RÈGLE.
- **Le résultat H-3** : mesuré (bêta-binomial 5 %), non pré-décidé.
- **La classe servie en -2** : A seule (décision 108, E-I-3 close).
- **(b) CA chemin natif** : item formé « calibration suivante », non rétroactif.
- **Neutralité de version** si v3.6.0 : `PR-U4-3-bis` (H-1).

**Préconditions dures AVANT le commit** (items formés à déclencheur — zéro dette nue) :
1. **GARDE-HELIUS-2b-ii fusionné** (arguments recorder finaux, §5a) — **en cours** (`docs/G0-lot-garde-helius-2b-ii.md`, cp-1 en vol) ; **+ 2b-iii** (scripts `u4-*` payants avant la course, D-label `chainstack`, CHANTIERS:605).
2. **C-15 (Mondrian 2003 [lu])** : SATISFAITE (note orchestrateur G0-lot-u4b `:358`).
3. **`PR-U4-3-bis`** si impl ≠ v3.5.0 (H-1).
4. **Procurement `PR-U4-4-a`** (chapitre Mondrian 2022, ISBN 978-3-031-06648-1) : formé, non bloquant (substitut 2003 [lu]).
5. **Contrainte d'ordre NARABI-OPS-1d (ruling Q10, amendement §3)** : `apps/sentinel/src/rpc.ts` au gel D4 ; **NARABI-OPS-1d NE fusionne PAS entre le commit du prereg et la clôture de la course** (sinon `rpc.ts` change ⇒ gel rompu ⇒ re-gel + re-prereg). Cohérent décision 118 (-1d après temps 1). `record.ts`/`rpc2.ts` sont HORS gel ⇒ l'ordre 2b-ii ↔ prereg ne crée pas de conflit.
6. **Condition (i-a)** : si -1b touche le réducteur pur de `u3-realized.mjs` (l.81-267), extraire le réducteur + 8ᵉ sha au gel D4 AVANT le prereg.

---

## (8) Preuve d'intégrité sous régime B (commandes)

**Principe (AM-1)** : « `git status` propre » n'est PAS une preuve ; la preuve est « **blobs HEAD inchangés** ».

**(8a) Recompute des 7 sha gelés + labeler** (à rejouer au commit ; divergence vs §2 = ÉCART = STOP) :
```
for f in \
  scripts/census/u4b/u4b-scores.mjs scripts/census/u4b/u4b-reduce.mjs scripts/record-u4b-calib.mjs \
  apps/sentinel/src/ukemi/wadray.ts apps/sentinel/src/ukemi/abi.ts packages/hikae/src/l1-split.ts \
  apps/sentinel/src/rpc.ts scripts/census/u3-realized.mjs ; do
  echo "$(git -C F:/Monark show "HEAD:$f" | tr -d '\r' | sha256sum | cut -d' ' -f1)  $f"
done
```

**(8b) `--prereg-sha`** = sha256 LF du blob committé de CE fichier (naît au commit) :
```
git -C F:/Monark show HEAD:docs/PLAN-u4b-prereg.md | tr -d '\r' | sha256sum
```

**(8c) `--labeler-sha`** = sha256 LF du blob HEAD de `u3-realized.mjs` (= `755b3a38…` aujourd'hui), écrit dans la sonde + le brut de découverte avant le premier appel :
```
git -C F:/Monark show HEAD:scripts/census/u3-realized.mjs | tr -d '\r' | sha256sum
```

**(8d) Invariants réassertés inchangés au commit** : `book_digest 034fbff9…` (`ukemi.test.ts:29`) ; `PINNED_DIGEST 267cd991…` (`ukemi-u4-scores.test.ts:20`) ; **`U3-realized.jsonl b4d93590…`** (`PROVENANCE-u3.md:10`, ruling Q11) ; digests de cellule U-4b A `dc9ab572…` / B `89897a61…` ; fixtures `u4/` (`743e9499…/97035715…/8b84e095…`) et `u4b/` sha-pinnées ; ordre des fournisseurs (`rpc2.ts:268-269`).

---

## Provenance des rulings (traçabilité — comment Q1–Q11 sont résolus)

- **Source des rulings** : `docs/CHANTIERS.md`, puce « 2026-09-21 ~21:1x UTC — prereg U-4b-1b : avis advisor-defi Q11/Q4/Q6 reçu … rulings orchestrateur » ; avis verbatim `F:\PRODUITS\etude-2026-09-21\ukemi-u4b-prerequis\AVIS-advisor-defi-prereg-u4b-1b-2026-09-21.md` (advisor-defi `claude-fable-5-1`, conseil jamais verdict).
- **Q1** périmètre = 8 sections + §DISC/H-n/sonde (G0 §7). **Q2** `rpc.ts` `0e232519…` figé (amendement ADR-U4b §1, complet). **Q3** (constat DRAFT « amendement jamais atterri ») **périmé** : la substance est EN LIGNE dans ADR-U4b D4/D5 (lignes 18-19) depuis la fusion `8ba2cbc` (`798b4e9`, G1 GARDE-HELIUS-2b-i) ; amendement daté C-7 `2d1d685`. **Q4** = (a) confirmé, formulation C-V-7 verbatim ; (b) item « calibration suivante » non rétroactif. **Q5** item « agrégat ≠ Σ jambes » CLOS (ceil par jambe, v3.5.0). **Q6** H-3 → bêta-binomial exact 5 % par strate ; H-4 → 5 % + e2 11,1 %/12,7 % ⇒ NON attendu + part de Y post-premier-appel ; H-5 → dérivé de nMin ; « rien de servi ne dépend de ces trois constantes ». **Q7** `--max-ru` fixé depuis le floor lu sur place ; réservation Bell en RU au temps 2. **Q8** E-I-3 close par 108. **Q9** créneaux à reconfirmer au journal sentinel. **Q10** contrainte d'ordre NARABI-OPS-1d (amendement §3). **Q11** convention Y = ADR-U3 D1/D2 (adoptée 2026-09-20) + pin `b4d93590…` + `--labeler-sha` + règle d'abstention + confinement section live (condition (i-a)).
- **Décisions investisseur** : 91 (premier franchissement), 108 (classe A seule), 110/111 (anti-close / hors miroir), 113 (rapprochement), 115 (16 M RU), 118 (NARABI-OPS-1d après temps 1), **119** (GO durable, plafonds non levés), **121** (plafond Chainstack PAR COMPTE). ADR-U3 D1/D2 (`docs/adr/ADR-U3-realized-labels.md`, adoptée 2026-09-20). Amendement ADR-U4b daté 2026-09-21 (`docs/adr/ADR-U4b-calibration-episode-frais.md`, §1-§4).
- **Modèle** : worker `claude-opus-4-8[1m]`, effort max. **R-20** : le worker ne committe pas ; **R-21** : sortie vérifiée adversarialement par l'orchestrateur avant consommation. Mesures : `MESURES.md`.

---
## NOTE ORCHESTRATEUR (2026-09-21 ~23:0x UTC) — ce fichier est le CANDIDAT, pas le prereg
Le prereg sera committé SEUL sous `docs/PLAN-u4b-prereg.md` après la fusion de 2b-ii ET 2b-iii, avec : (1) les 8 sha recomputés depuis les blobs HEAD du commit ; (2) les arguments du recorder gardé confirmés sur le code fusionné ; (3) `--max-ru` fixé depuis le floor Chainstack lu sur place ; (4) **clause de go U-6 conditionnel (décision 122)** : « GO U-6 sans nouveau tour ssi `reconcile` = GO (Δdashboard ≤ ledger_run, bande souple 113) ET aucune strate servie en NON au test H-3 (bêta-binomial 5 %) ET `labels_no_quorum` non résolus = 0 ; sinon retour investisseur avec les chiffres » — cette clause ne change rien de ce qui est servi, elle ne pré-enregistre que la condition du go.
(5) **CARTO-T1-1 (cartographie baseline, 2026-09-21)** : le labeler `scripts/census/u3-realized.mjs` prépend une jambe Chainstack HORS garde si `CHAINSTACK_ETH_URL` est posée dans son environnement. Ruling orchestrateur, à PRÉ-ENREGISTRER dans le prereg : **le labeler tourne en KEYLESS quorum-2 SEULEMENT pendant la course** (processus lancé avec `CHAINSTACK_ETH_URL` absente de son env — commande écrite au runbook de course, vérifiée par la ligne `endpoints` du brut de découverte qui ne doit lister aucun hôte Chainstack) ; ainsi la phrase « aucun script hors garde » du §5 est VRAIE et le Δdashboard Chainstack ne contient que le recorder gardé + le job Narabi (118). Migration du labeler sous le garde = item formé, déclencheur « calibration suivante ».
